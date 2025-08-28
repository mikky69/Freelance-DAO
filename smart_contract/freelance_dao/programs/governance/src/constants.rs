pub const DAO_CONFIG_SEED: &[u8] = b"dao_config";
pub const PROPOSAL_SEED: &[u8] = b"proposal";
pub const VOTE_SEED: &[u8] = b"vote";
pub const MEMBER_SEED: &[u8] = b"member";
pub const TREASURY_SEED: &[u8] = b"treasury";

pub const DEFAULT_LIGHT_FEE_USDC: u64 = 5_000_000; // 5 USDC (6 decimals)
pub const DEFAULT_MAJOR_FEE_USDC: u64 = 50_000_000; // 50 USDC
pub const DEFAULT_VOTE_FEE_LAMPORTS: u64 = 100_000; // 0.0001 SOL
pub const VOTE_WEIGHT_SCALE: u64 = 100; // 1 $FLDAO = 10 votes (0.1)
pub const MAX_URI_LENGTH: usize = 200;