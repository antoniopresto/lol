use tauri::{Emitter, Manager};
#[cfg(desktop)]
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
#[cfg(desktop)]
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
#[cfg(desktop)]
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

fn show_and_focus(window: &tauri::WebviewWindow) {
    if let Err(e) = window.center() {
        eprintln!("failed to center window: {e}");
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
        if let Err(e) = window.set_focus() {
            eprintln!("failed to focus window: {e}");
        }
    } else {
        show_and_focus(window);
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(desktop)]
            {
                let shortcut = Shortcut::new(Some(Modifiers::ALT), Code::Space);
                let window = app
                    .get_webview_window("main")
                    .expect("main window not found");

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
                    .icon(tauri::image::Image::from_bytes(include_bytes!("../icons/tray-icon@2x.png"))?)
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
