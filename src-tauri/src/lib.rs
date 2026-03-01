use std::sync::Mutex;
use std::time::Duration;
use base64::Engine;
use serde::Serialize;
use tauri::{Emitter, Manager};
use tauri_plugin_sql::{Migration, MigrationKind};
use walkdir::WalkDir;
#[cfg(desktop)]
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
#[cfg(desktop)]
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
#[cfg(desktop)]
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};
#[cfg(desktop)]
use tauri_plugin_autostart::MacosLauncher;

struct WindowConfig {
    position_pref: String,
}

impl Default for WindowConfig {
    fn default() -> Self {
        Self {
            position_pref: "top-third".to_string(),
        }
    }
}

#[derive(Default)]
struct AppCache {
    apps: Option<Vec<AppEntry>>,
}

fn position_near_top(window: &tauri::WebviewWindow) {
    let monitor = window
        .current_monitor()
        .ok()
        .flatten()
        .or_else(|| window.primary_monitor().ok().flatten());

    if let Some(monitor) = monitor {
        let monitor_size = monitor.size();
        let monitor_pos = monitor.position();

        if let Ok(window_size) = window.outer_size() {
            let x = monitor_pos.x + (monitor_size.width as i32 - window_size.width as i32) / 2;
            let y = monitor_pos.y + (monitor_size.height as i32) / 5;

            if let Err(e) = window.set_position(tauri::PhysicalPosition::new(x, y)) {
                eprintln!("failed to position window: {e}");
            }
        }
    } else if let Err(e) = window.center() {
        eprintln!("failed to center window: {e}");
    }
}

fn show_and_focus(window: &tauri::WebviewWindow) {
    let position_pref = window
        .app_handle()
        .try_state::<Mutex<WindowConfig>>()
        .and_then(|state| state.lock().ok().map(|s| s.position_pref.clone()))
        .unwrap_or_else(|| "top-third".to_string());

    if position_pref == "center" {
        if let Err(e) = window.center() {
            eprintln!("failed to center window: {e}");
        }
    } else {
        position_near_top(window);
    }

    if let Err(e) = window.show() {
        eprintln!("failed to show window: {e}");
    }
    if let Err(e) = window.set_focus() {
        eprintln!("failed to focus window: {e}");
    }
}

fn toggle_window(window: &tauri::WebviewWindow) {
    let visible = window.is_visible().unwrap_or(false);
    let focused = window.is_focused().unwrap_or(false);

    if visible && focused {
        if let Err(e) = window.hide() {
            eprintln!("failed to hide window: {e}");
        }
    } else if visible {
        show_and_focus(window);
    } else {
        show_and_focus(window);
    }
}

fn detect_content_type(content: &str) -> &'static str {
    let trimmed = content.trim();

    if trimmed.starts_with("http://") || trimmed.starts_with("https://") {
        return "link";
    }

    if (trimmed.len() == 4 || trimmed.len() == 7 || trimmed.len() == 9)
        && trimmed.starts_with('#')
        && trimmed[1..].chars().all(|c| c.is_ascii_hexdigit())
    {
        return "color";
    }

    if trimmed.starts_with("rgb(")
        || trimmed.starts_with("rgba(")
        || trimmed.starts_with("hsl(")
        || trimmed.starts_with("hsla(")
    {
        return "color";
    }

    "text"
}

fn start_clipboard_monitor(app_handle: tauri::AppHandle) {
    use tauri_plugin_clipboard_manager::ClipboardExt;

    std::thread::spawn(move || {
        let mut last_text = String::new();

        loop {
            std::thread::sleep(Duration::from_millis(500));

            let text = match app_handle.clipboard().read_text() {
                Ok(t) => t,
                Err(_) => continue,
            };

            if text.is_empty() || text == last_text {
                continue;
            }
            last_text = text.clone();

            let content_type = detect_content_type(&text);

            let elapsed = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default();
            let timestamp_ms = elapsed.as_secs() * 1000 + elapsed.subsec_millis() as u64;

            let payload = serde_json::json!({
                "content": text,
                "contentType": content_type,
                "timestamp": timestamp_ms,
            });

            if let Err(e) = app_handle.emit("clipboard-changed", payload) {
                eprintln!("failed to emit clipboard-changed: {e}");
            }
        }
    });
}

#[derive(Serialize)]
struct FileEntryResult {
    id: String,
    name: String,
    path: String,
    #[serde(rename = "fileType")]
    file_type: String,
    size: u64,
    #[serde(rename = "modifiedAt")]
    modified_at: u64,
}

fn detect_file_type(path: &std::path::Path) -> &'static str {
    if path.is_dir() {
        return "folder";
    }

    match path
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_lowercase())
        .as_deref()
    {
        Some(
            "ts" | "tsx" | "js" | "jsx" | "rs" | "py" | "rb" | "go" | "java" | "c" | "cpp" | "h"
            | "hpp" | "cs" | "swift" | "kt" | "scala" | "sh" | "bash" | "zsh" | "json" | "yaml"
            | "yml" | "toml" | "xml" | "html" | "css" | "scss" | "less" | "sql" | "graphql"
            | "proto" | "lua" | "r" | "php" | "pl" | "ex" | "exs" | "erl" | "hs" | "ml"
            | "vim" | "el" | "clj" | "dart",
        ) => "code",
        Some("png" | "jpg" | "jpeg" | "gif" | "bmp" | "svg" | "webp" | "ico" | "tiff" | "avif") => {
            "image"
        }
        Some("pdf") => "pdf",
        Some("zip" | "tar" | "gz" | "bz2" | "xz" | "7z" | "rar" | "dmg" | "iso") => "archive",
        Some("xlsx" | "xls" | "csv" | "numbers" | "ods") => "spreadsheet",
        Some("pptx" | "ppt" | "key" | "odp") => "presentation",
        Some(
            "md" | "txt" | "rtf" | "doc" | "docx" | "pages" | "odt" | "tex" | "log" | "conf"
            | "cfg" | "ini" | "env" | "fig",
        ) => "document",
        _ => "document",
    }
}

fn is_ignored_dir(name: &str) -> bool {
    matches!(
        name,
        ".git"
            | "node_modules"
            | "__pycache__"
            | ".next"
            | ".cache"
            | ".vscode"
            | ".idea"
            | "target"
            | "dist"
            | "build"
            | ".Trash"
    )
}

fn is_path_within_home(path: &std::path::Path) -> bool {
    let canonical = match path.canonicalize() {
        Ok(p) => p,
        Err(_) => return false,
    };
    if let Some(home) = dirs_next::home_dir() {
        return canonical.starts_with(&home);
    }
    false
}

#[tauri::command(async)]
fn search_files(query: String, paths: Vec<String>, max_results: usize) -> Vec<FileEntryResult> {
    let max = if max_results == 0 { 200 } else { max_results };
    let query_lower = query.to_lowercase();
    let mut results: Vec<FileEntryResult> = Vec::new();

    let search_paths: Vec<String> = if paths.is_empty() {
        if let Some(home) = dirs_next::home_dir() {
            let home_str = home.to_string_lossy().to_string();
            vec![
                format!("{home_str}/Documents"),
                format!("{home_str}/Downloads"),
                format!("{home_str}/Desktop"),
                format!("{home_str}/Projects"),
            ]
        } else {
            return results;
        }
    } else {
        paths
    };

    for search_path in &search_paths {
        if results.len() >= max {
            break;
        }

        let walker = WalkDir::new(search_path)
            .max_depth(5)
            .follow_links(false)
            .into_iter()
            .filter_entry(|entry| {
                let name = entry.file_name().to_string_lossy();
                if name.starts_with('.') && entry.depth() > 0 {
                    return false;
                }
                if entry.file_type().is_dir() && is_ignored_dir(&name) {
                    return false;
                }
                true
            });

        for entry in walker.flatten() {
            if results.len() >= max {
                break;
            }

            let name = entry.file_name().to_string_lossy().to_string();

            if !query_lower.is_empty() && !name.to_lowercase().contains(&query_lower) {
                continue;
            }

            if entry.depth() == 0 {
                continue;
            }

            let path = entry.path();
            let metadata = match entry.metadata() {
                Ok(m) => m,
                Err(_) => continue,
            };

            let size = metadata.len();
            let modified_at = metadata
                .modified()
                .ok()
                .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                .map(|d| d.as_millis() as u64)
                .unwrap_or(0);

            let file_type = detect_file_type(path);
            let path_str = path.to_string_lossy().to_string();

            let id = format!("fs-{:x}", {
                use std::hash::{Hash, Hasher};
                let mut h = std::collections::hash_map::DefaultHasher::new();
                path_str.hash(&mut h);
                h.finish()
            });

            results.push(FileEntryResult {
                id,
                name,
                path: path_str,
                file_type: file_type.to_string(),
                size,
                modified_at,
            });
        }
    }

    results
}

#[tauri::command]
fn open_file(path: String) -> Result<(), String> {
    let p = std::path::Path::new(&path);
    if !is_path_within_home(p) {
        return Err(format!("path not allowed: {path}"));
    }
    open::that(&path).map_err(|e| format!("failed to open {path}: {e}"))
}

#[tauri::command]
fn reveal_in_finder(path: String) -> Result<(), String> {
    let p = std::path::Path::new(&path);
    if !is_path_within_home(p) {
        return Err(format!("path not allowed: {path}"));
    }

    #[cfg(target_os = "macos")]
    {
        let output = std::process::Command::new("open")
            .arg("-R")
            .arg(&path)
            .output()
            .map_err(|e| format!("failed to reveal {path}: {e}"))?;
        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(format!("failed to reveal {path}: {stderr}"));
        }
        return Ok(());
    }

    #[cfg(target_os = "windows")]
    {
        let output = std::process::Command::new("explorer")
            .arg(format!("/select,{}", &path))
            .output()
            .map_err(|e| format!("failed to reveal {path}: {e}"))?;
        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(format!("failed to reveal {path}: {stderr}"));
        }
        return Ok(());
    }

    #[cfg(target_os = "linux")]
    {
        let parent = std::path::Path::new(&path)
            .parent()
            .map(|p| p.to_string_lossy().to_string())
            .unwrap_or_else(|| path.clone());
        let output = std::process::Command::new("xdg-open")
            .arg(&parent)
            .output()
            .map_err(|e| format!("failed to reveal: {e}"))?;
        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(format!("failed to reveal: {stderr}"));
        }
        return Ok(());
    }

    #[allow(unreachable_code)]
    Err("unsupported platform".to_string())
}

#[tauri::command]
fn move_to_trash(path: String) -> Result<(), String> {
    let p = std::path::Path::new(&path);
    if !is_path_within_home(p) {
        return Err(format!("path not allowed: {path}"));
    }
    trash::delete(p).map_err(|e| format!("failed to trash {path}: {e}"))
}

#[derive(Serialize, Clone)]
struct AppEntry {
    id: String,
    name: String,
    path: String,
    icon: Option<String>,
}

fn scan_app_dir(dir: &std::path::Path, depth: usize) -> Vec<std::path::PathBuf> {
    let mut apps = Vec::new();
    let Ok(entries) = std::fs::read_dir(dir) else {
        return apps;
    };

    for entry in entries.flatten() {
        let path = entry.path();
        if path.extension().map_or(false, |e| e == "app") {
            apps.push(path);
        } else if depth > 0 && path.is_dir() {
            let name = path.file_name().unwrap_or_default().to_string_lossy();
            if !name.starts_with('.') {
                apps.extend(scan_app_dir(&path, depth - 1));
            }
        }
    }
    apps
}

fn read_info_plist(app_path: &std::path::Path) -> Option<plist::Dictionary> {
    let info_plist = app_path.join("Contents/Info.plist");
    plist::from_file(info_plist).ok()
}

fn display_name_from_plist(dict: &plist::Dictionary) -> Option<String> {
    dict.get("CFBundleDisplayName")
        .or_else(|| dict.get("CFBundleName"))
        .and_then(|v| v.as_string())
        .map(|s| s.to_string())
}

fn extract_png_from_icns(icns_data: &[u8]) -> Option<Vec<u8>> {
    if icns_data.len() < 8 || &icns_data[0..4] != b"icns" {
        return None;
    }

    let total_len = u32::from_be_bytes(icns_data[4..8].try_into().ok()?) as usize;
    let total_len = total_len.min(icns_data.len());

    let preferred: &[&[u8; 4]] = &[
        b"icp5", b"icp6", b"icp4", b"ic07",
    ];

    let mut offset = 8;
    let mut entries: Vec<(&[u8], &[u8])> = Vec::new();

    while offset + 8 <= total_len {
        let type_code = &icns_data[offset..offset + 4];
        let entry_len = u32::from_be_bytes(icns_data[offset + 4..offset + 8].try_into().ok()?) as usize;
        if entry_len < 8 || offset + entry_len > total_len {
            break;
        }
        let data = &icns_data[offset + 8..offset + entry_len];
        entries.push((type_code, data));
        offset += entry_len;
    }

    for pref in preferred {
        for (type_code, data) in &entries {
            if *type_code == pref.as_slice() && data.starts_with(&[0x89, 0x50, 0x4E, 0x47]) {
                return Some(data.to_vec());
            }
        }
    }

    let max_fallback_size = 200_000;
    for (_, data) in &entries {
        if data.starts_with(&[0x89, 0x50, 0x4E, 0x47]) && data.len() <= max_fallback_size {
            return Some(data.to_vec());
        }
    }

    None
}

fn extract_app_icon(app_path: &std::path::Path, dict: &plist::Dictionary) -> Option<String> {
    let icon_name = dict
        .get("CFBundleIconFile")
        .and_then(|v| v.as_string())
        .unwrap_or("AppIcon");

    let icon_filename = if icon_name.ends_with(".icns") {
        icon_name.to_string()
    } else {
        format!("{icon_name}.icns")
    };

    let icns_path = app_path.join("Contents/Resources").join(&icon_filename);
    let icns_data = std::fs::read(&icns_path).ok()?;
    let png_data = extract_png_from_icns(&icns_data)?;

    Some(format!(
        "data:image/png;base64,{}",
        base64::engine::general_purpose::STANDARD.encode(&png_data)
    ))
}

fn build_app_list() -> Vec<AppEntry> {
    let mut apps = Vec::new();
    let mut seen_paths = std::collections::HashSet::new();

    let mut dirs = vec![std::path::PathBuf::from("/Applications")];
    if let Some(home) = dirs_next::home_dir() {
        dirs.push(home.join("Applications"));
    }

    for dir in &dirs {
        for app_path in scan_app_dir(dir, 1) {
            let path_str = app_path.to_string_lossy().to_string();
            if !seen_paths.insert(path_str.clone()) {
                continue;
            }

            let file_stem = app_path
                .file_stem()
                .map(|s| s.to_string_lossy().to_string())
                .unwrap_or_default();

            let plist_dict = read_info_plist(&app_path);
            let name = plist_dict
                .as_ref()
                .and_then(display_name_from_plist)
                .unwrap_or_else(|| file_stem.clone());
            let icon = plist_dict
                .as_ref()
                .and_then(|dict| extract_app_icon(&app_path, dict));

            let id = format!("app-{:x}", {
                use std::hash::{Hash, Hasher};
                let mut h = std::collections::hash_map::DefaultHasher::new();
                path_str.hash(&mut h);
                h.finish()
            });

            apps.push(AppEntry {
                id,
                name,
                path: path_str,
                icon,
            });
        }
    }

    apps.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    apps
}

#[tauri::command(async)]
fn discover_applications(
    state: tauri::State<'_, Mutex<AppCache>>,
    force_refresh: bool,
) -> Vec<AppEntry> {
    if !force_refresh {
        if let Ok(cache) = state.lock() {
            if let Some(ref apps) = cache.apps {
                return apps.clone();
            }
        }
    }

    let apps = build_app_list();

    if let Ok(mut cache) = state.lock() {
        cache.apps = Some(apps.clone());
    }

    apps
}

fn is_valid_app_path(path: &std::path::Path) -> bool {
    let canonical = match path.canonicalize() {
        Ok(p) => p,
        Err(_) => return false,
    };

    if canonical.extension().map_or(true, |e| e != "app") {
        return false;
    }

    let mut allowed_dirs = vec![std::path::PathBuf::from("/Applications")];
    if let Some(home) = dirs_next::home_dir() {
        allowed_dirs.push(home.join("Applications"));
    }

    for dir in &allowed_dirs {
        if let Ok(canonical_dir) = dir.canonicalize() {
            if canonical.starts_with(&canonical_dir) {
                return true;
            }
        }
    }
    false
}

#[tauri::command]
fn launch_application(path: String) -> Result<(), String> {
    let p = std::path::Path::new(&path);
    if !is_valid_app_path(p) {
        return Err(format!("application not allowed: {path}"));
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg("-a")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("failed to launch {path}: {e}"))?;
        return Ok(());
    }

    #[allow(unreachable_code)]
    {
        open::that(&path).map_err(|e| format!("failed to launch {path}: {e}"))
    }
}

#[tauri::command]
fn set_window_position_pref(
    state: tauri::State<'_, Mutex<WindowConfig>>,
    position: String,
) -> Result<(), String> {
    match position.as_str() {
        "center" | "top-third" => {
            if let Ok(mut config) = state.lock() {
                config.position_pref = position;
                Ok(())
            } else {
                Err("failed to acquire config lock".to_string())
            }
        }
        _ => Err(format!("invalid position: {position}")),
    }
}

fn db_migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: "
                CREATE TABLE IF NOT EXISTS clipboard_entries (
                    id TEXT PRIMARY KEY,
                    content TEXT NOT NULL,
                    content_type TEXT NOT NULL DEFAULT 'text',
                    source_app TEXT NOT NULL DEFAULT '',
                    copied_at TEXT NOT NULL,
                    pinned INTEGER NOT NULL DEFAULT 0
                );

                CREATE TABLE IF NOT EXISTS snippets (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    keyword TEXT NOT NULL DEFAULT '',
                    content TEXT NOT NULL,
                    category TEXT NOT NULL DEFAULT 'general',
                    tags TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(tags)),
                    created_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS quicklinks (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    link TEXT NOT NULL,
                    type TEXT NOT NULL DEFAULT 'url',
                    application TEXT,
                    tags TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(tags)),
                    created_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS notes (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL DEFAULT '',
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS recent_commands (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    command_id TEXT NOT NULL,
                    used_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
                );

                CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL
                );

                CREATE TRIGGER IF NOT EXISTS notes_auto_updated_at
                AFTER UPDATE ON notes
                BEGIN
                    UPDATE notes SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
                    WHERE id = NEW.id;
                END;
            ",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "add_fts_and_indexes",
            sql: "
                CREATE VIRTUAL TABLE IF NOT EXISTS clipboard_entries_fts USING fts5(
                    content,
                    content='clipboard_entries',
                    content_rowid='rowid'
                );

                CREATE TRIGGER IF NOT EXISTS clipboard_entries_ai AFTER INSERT ON clipboard_entries BEGIN
                    INSERT INTO clipboard_entries_fts(rowid, content) VALUES (NEW.rowid, NEW.content);
                END;
                CREATE TRIGGER IF NOT EXISTS clipboard_entries_ad AFTER DELETE ON clipboard_entries BEGIN
                    INSERT INTO clipboard_entries_fts(clipboard_entries_fts, rowid, content) VALUES ('delete', OLD.rowid, OLD.content);
                END;
                CREATE TRIGGER IF NOT EXISTS clipboard_entries_au AFTER UPDATE ON clipboard_entries BEGIN
                    INSERT INTO clipboard_entries_fts(clipboard_entries_fts, rowid, content) VALUES ('delete', OLD.rowid, OLD.content);
                    INSERT INTO clipboard_entries_fts(rowid, content) VALUES (NEW.rowid, NEW.content);
                END;

                CREATE VIRTUAL TABLE IF NOT EXISTS snippets_fts USING fts5(
                    name,
                    keyword,
                    content,
                    content='snippets',
                    content_rowid='rowid'
                );

                CREATE TRIGGER IF NOT EXISTS snippets_ai AFTER INSERT ON snippets BEGIN
                    INSERT INTO snippets_fts(rowid, name, keyword, content) VALUES (NEW.rowid, NEW.name, NEW.keyword, NEW.content);
                END;
                CREATE TRIGGER IF NOT EXISTS snippets_ad AFTER DELETE ON snippets BEGIN
                    INSERT INTO snippets_fts(snippets_fts, rowid, name, keyword, content) VALUES ('delete', OLD.rowid, OLD.name, OLD.keyword, OLD.content);
                END;
                CREATE TRIGGER IF NOT EXISTS snippets_au AFTER UPDATE ON snippets BEGIN
                    INSERT INTO snippets_fts(snippets_fts, rowid, name, keyword, content) VALUES ('delete', OLD.rowid, OLD.name, OLD.keyword, OLD.content);
                    INSERT INTO snippets_fts(rowid, name, keyword, content) VALUES (NEW.rowid, NEW.name, NEW.keyword, NEW.content);
                END;

                CREATE VIRTUAL TABLE IF NOT EXISTS quicklinks_fts USING fts5(
                    name,
                    link,
                    content='quicklinks',
                    content_rowid='rowid'
                );

                CREATE TRIGGER IF NOT EXISTS quicklinks_ai AFTER INSERT ON quicklinks BEGIN
                    INSERT INTO quicklinks_fts(rowid, name, link) VALUES (NEW.rowid, NEW.name, NEW.link);
                END;
                CREATE TRIGGER IF NOT EXISTS quicklinks_ad AFTER DELETE ON quicklinks BEGIN
                    INSERT INTO quicklinks_fts(quicklinks_fts, rowid, name, link) VALUES ('delete', OLD.rowid, OLD.name, OLD.link);
                END;
                CREATE TRIGGER IF NOT EXISTS quicklinks_au AFTER UPDATE ON quicklinks BEGIN
                    INSERT INTO quicklinks_fts(quicklinks_fts, rowid, name, link) VALUES ('delete', OLD.rowid, OLD.name, OLD.link);
                    INSERT INTO quicklinks_fts(rowid, name, link) VALUES (NEW.rowid, NEW.name, NEW.link);
                END;

                CREATE INDEX IF NOT EXISTS idx_clipboard_copied_at ON clipboard_entries(copied_at);
                CREATE INDEX IF NOT EXISTS idx_clipboard_pinned ON clipboard_entries(pinned);
                CREATE INDEX IF NOT EXISTS idx_recent_commands_used_at ON recent_commands(used_at);
                CREATE UNIQUE INDEX IF NOT EXISTS idx_snippets_keyword ON snippets(keyword) WHERE keyword != '';
            ",
            kind: MigrationKind::Up,
        },
    ]
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:raycast_clone.db", db_migrations())
                .build(),
        )
        .manage(Mutex::new(WindowConfig::default()))
        .manage(Mutex::new(AppCache::default()))
        .invoke_handler(tauri::generate_handler![
            set_window_position_pref,
            search_files,
            open_file,
            reveal_in_finder,
            move_to_trash,
            discover_applications,
            launch_application
        ])
        .setup(|app| {
            #[cfg(desktop)]
            {
                app.handle().plugin(tauri_plugin_autostart::init(
                    MacosLauncher::LaunchAgent,
                    None,
                ))?;

                let shortcut = Shortcut::new(Some(Modifiers::ALT), Code::Space);
                let window = app
                    .get_webview_window("main")
                    .expect("main window not found");

                let window_for_blur = window.clone();
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::Focused(false) = event {
                        if let Err(e) = window_for_blur.hide() {
                            eprintln!("failed to hide on blur: {e}");
                        }
                    }
                });

                #[cfg(target_os = "macos")]
                {
                    use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};
                    if let Err(e) =
                        apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None)
                    {
                        eprintln!("failed to apply vibrancy: {e}");
                    }
                }

                position_near_top(&window);

                start_clipboard_monitor(app.handle().clone());

                let window_for_shortcut = window.clone();
                app.handle().plugin(
                    tauri_plugin_global_shortcut::Builder::new()
                        .with_handler(move |_app, scut, event| {
                            if scut == &shortcut && event.state() == ShortcutState::Pressed {
                                toggle_window(&window_for_shortcut);
                            }
                        })
                        .build(),
                )?;

                app.global_shortcut().register(shortcut)?;

                let show_item =
                    MenuItem::with_id(app, "show", "Show Raycast", true, None::<&str>)?;
                let clipboard_item =
                    MenuItem::with_id(app, "clipboard", "Clipboard History", true, None::<&str>)?;
                let snippets_item =
                    MenuItem::with_id(app, "snippets", "Snippets", true, None::<&str>)?;
                let settings_item =
                    MenuItem::with_id(app, "settings", "Settings", true, None::<&str>)?;
                let check_updates_item = MenuItem::with_id(
                    app,
                    "check-updates",
                    "Check for Updates",
                    true,
                    None::<&str>,
                )?;
                let about_item =
                    MenuItem::with_id(app, "about", "About Raycast Clone", true, None::<&str>)?;
                let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

                let menu = Menu::with_items(
                    app,
                    &[
                        &show_item,
                        &PredefinedMenuItem::separator(app)?,
                        &clipboard_item,
                        &snippets_item,
                        &settings_item,
                        &PredefinedMenuItem::separator(app)?,
                        &check_updates_item,
                        &about_item,
                        &quit_item,
                    ],
                )?;

                let window_for_menu = window.clone();
                let window_for_tray = window.clone();

                TrayIconBuilder::new()
                    .icon(tauri::image::Image::from_bytes(include_bytes!(
                        "../icons/tray-icon@2x.png"
                    ))?)
                    .icon_as_template(true)
                    .tooltip("Raycast Clone")
                    .menu(&menu)
                    .show_menu_on_left_click(false)
                    .on_menu_event(move |app, event| match event.id().as_ref() {
                        "show" => {
                            show_and_focus(&window_for_menu);
                        }
                        "clipboard" | "snippets" | "settings" | "about" | "check-updates" => {
                            show_and_focus(&window_for_menu);
                            if let Err(e) =
                                app.emit("tray-navigate", event.id().as_ref().to_string())
                            {
                                eprintln!("failed to emit tray-navigate: {e}");
                            }
                        }
                        "quit" => {
                            app.exit(0);
                        }
                        _ => {}
                    })
                    .on_tray_icon_event(move |_tray, event| {
                        if let TrayIconEvent::Click {
                            button: MouseButton::Left,
                            button_state: MouseButtonState::Up,
                            ..
                        } = event
                        {
                            toggle_window(&window_for_tray);
                        }
                    })
                    .build(app)?;
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
