class Keys {
  public entries: string[];
  public language!: string;

  public constructor(...entries: string[]) {
    this.entries = entries;
  }
}

export default Keys;
