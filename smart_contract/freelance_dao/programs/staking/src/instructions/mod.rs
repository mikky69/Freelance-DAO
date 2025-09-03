// programs/staking/src/instructions/mod.rs
pub mod init;
pub mod staking;
pub mod rewards;
pub mod admin;
pub mod utils;
pub mod query;  

pub use init::*;
pub use staking::*;
pub use rewards::*;
pub use admin::*;
pub use utils::*;
pub use query::*;