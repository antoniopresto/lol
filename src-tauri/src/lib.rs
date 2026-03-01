use std::sync::Mutex;
use std::time::Duration;
use serde::Serialize;
use tauri::{Emitter, Manager};
use walkdir::WalkDir;
#[cfg(desktop)]
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
#[cfg(desktop)]
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
#[cfg(desktop)]
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_shell::init())
        .manage(Mutex::new(WindowConfig::default()))
        .invoke_handler(tauri::generate_handler![
            set_window_position_pref,
            search_files,
            open_file,
            reveal_in_finder,
            move_to_trash
        ])
        .setup(|app| {
            #[cfg(desktop)]
            {
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
