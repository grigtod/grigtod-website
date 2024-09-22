window.addEventListener("DOMContentLoaded", () => {
    const tabbar = new TabBar("nav");
});

class TabBar {
    /** Tab bar element */
    constructor(el) {
        this.el = document.querySelector(el);
        this.el?.setAttribute("data-pristine", "true");
        this.el?.addEventListener("click", this.switchTab.bind(this));
    }
    
    /** Make the clicked tab active. */
    switchTab(e) {
        // allow animations, which were prevented on load
        this.el?.removeAttribute("data-pristine");

        const target = e.target;
        const href = target.getAttribute("href");
        // target should be a link before assigning the “current” state
        if (href) {
            // remove the state from the current page…
            const currentPage = this.el?.querySelector(`[aria-current="page"]`);
            
            if (currentPage) {
                currentPage.removeAttribute("aria-current");
            }
            // …and apply it to the next
            target.setAttribute("aria-current", "page");
        }
    }
}
