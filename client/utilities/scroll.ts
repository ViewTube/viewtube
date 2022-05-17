export class Scroll {
  static scrollPosition: number = 0;
  static prevScrollPosition: number = 0;
  static absoluteStartPosition: number = 0;
  static posAbsolute: boolean = false;

  static setScrollPosition(pos: number) {
    this.scrollPosition = pos;
    if (this.scrollPosition > this.prevScrollPosition && this.posAbsolute === false) {
      this.absoluteStartPosition = this.scrollPosition;
      this.posAbsolute = true;
    }
    if (this.scrollPosition < this.absoluteStartPosition && this.posAbsolute === true) {
      this.posAbsolute = false;
    }
    if (
      this.scrollPosition < this.prevScrollPosition &&
      this.scrollPosition > this.absoluteStartPosition + 80 &&
      this.posAbsolute === true
    ) {
      this.absoluteStartPosition = this.scrollPosition - 80;
    }
    this.prevScrollPosition = this.scrollPosition;

    if (pos <= 0) {
      this.posAbsolute = false;
    }
    return {
      topPosition: this.posAbsolute ? this.absoluteStartPosition : 0,
      posAbsolute: this.posAbsolute
    };
  }
}
