// Interface for password hashing and verification
export interface IHashProvider {
  // Hash a password
  hash(password: string): Promise<string>;

  // Verify a password against a hash
  verify(password: string, hash: string): Promise<boolean>;

  // Check if a hash needs to be rehashed (for algorithm upgrades)
  needsRehash(hash: string): boolean;

  // Get the algorithm information
  getAlgorithmInfo(): {
    name: string;
    version: string;
    rounds?: number;
  };
}