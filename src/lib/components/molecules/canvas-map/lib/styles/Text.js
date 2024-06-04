export class Text {
  constructor(options) {
    this.content = options?.content
    this.fontFamily = options?.fontFamily || "var(--text-sans)"
    this.fontSize = options?.fontSize || 14
    this.lineHeight = options?.lineHeight || 1.4
    this.color = options?.color || "#121212"
  }
}
