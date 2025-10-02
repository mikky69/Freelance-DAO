// state/mod.rs - Add this to exports
pub mod admin_config;
pub mod counter;
pub mod dispute;
pub mod panel;
pub mod panel_vote; // ← NEW

pub use admin_config::*;
pub use counter::*;
pub use dispute::*;
pub use panel::*;
pub use panel_vote::*; // ← NEW
