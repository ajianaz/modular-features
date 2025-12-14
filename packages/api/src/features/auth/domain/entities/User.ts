export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public name: string,
    public passwordHash: string,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(email: string, name: string, passwordHash: string): User {
    const now = new Date();
    const id = crypto.randomUUID();

    return new User(id, email, name, passwordHash, now, now);
  }

  updateEmail(email: string): User {
    return new User(
      this.id,
      email,
      this.name,
      this.passwordHash,
      this.createdAt,
      new Date()
    );
  }

  updateName(name: string): User {
    return new User(
      this.id,
      this.email,
      name,
      this.passwordHash,
      this.createdAt,
      new Date()
    );
  }

  updatePassword(passwordHash: string): User {
    return new User(
      this.id,
      this.email,
      this.name,
      passwordHash,
      this.createdAt,
      new Date()
    );
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}