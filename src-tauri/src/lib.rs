use tauri::Manager;
#[cfg(desktop)]
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

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

                app.handle().plugin(
                    tauri_plugin_global_shortcut::Builder::new()
                        .with_handler(move |_app, scut, event| {
                            if scut == &shortcut && event.state() == ShortcutState::Pressed {
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
                            }
                        })
                        .build(),
                )?;

                app.global_shortcut().register(shortcut)?;
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
