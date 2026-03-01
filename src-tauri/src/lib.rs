use std::sync::Mutex;
use tauri::{Emitter, Manager};
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
        .manage(Mutex::new(WindowConfig::default()))
        .invoke_handler(tauri::generate_handler![set_window_position_pref])
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
