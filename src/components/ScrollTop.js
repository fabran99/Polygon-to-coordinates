import React, { Component } from "react";

export class ScrollTop extends Component {
  state = {
    show: false
  };
  styles = {
    position: "fixed",
    bottom: "0.5em",
    right: "0.5em",
    color: "white",
    background: "rgb(6, 127, 239)",
    padding: "0.7em 1em",
    borderRadius: "50%",
    zIndex: "100",
    cursor: "pointer",
    transition: "all 0.4s ease"
  };

  componentDidMount() {
    this.handle = this.handleScroll.bind(this);
    window.addEventListener("scroll", this.handle);
  }
  componentWillUnmount() {
    window.removeEventListener("scroll", this.handle);
  }

  handleScroll() {
    if (window.scrollY > 20 && !this.state.show) {
      this.setState({
        show: true
      });
    }
    if (window.scrollY < 20 && this.state.show) {
      this.setState({
        show: false
      });
    }
  }

  scrollTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  render() {
    return (
      <div
        className="scrollTop"
        onClick={this.scrollTop.bind(this)}
        style={{
          ...this.styles,
          transform: this.state.show ? "" : "translateY(150%)"
        }}
      >
        <i className="fas fa-arrow-up" />
      </div>
    );
  }
}

export default ScrollTop;
