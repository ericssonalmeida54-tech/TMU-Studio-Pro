import time
import os
from playwright.sync_api import sync_playwright

def verify_toggle_back():
    os.makedirs("verification", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto("http://localhost:3001/")
        time.sleep(2)

        try:
            page.get_by_role("button", name="Começar a Usar").click()
            time.sleep(1)
        except:
            pass

        # 1. Enable Dark Mode
        print("Toggling dark mode ON...")
        page.locator("aside .border-t button").last.click()
        time.sleep(1)

        is_dark = page.evaluate("document.documentElement.classList.contains('dark')")
        print(f"Dark mode active: {is_dark}")
        if not is_dark:
            print("FAILED: Did not switch to dark mode")
            exit(1)

        # 2. Disable Dark Mode
        print("Toggling dark mode OFF...")
        page.locator("aside .border-t button").last.click()
        time.sleep(1)

        is_dark_now = page.evaluate("document.documentElement.classList.contains('dark')")
        print(f"Dark mode active: {is_dark_now}")
        if is_dark_now:
            print("FAILED: Did not switch back to light mode")
            exit(1)

        print("SUCCESS: Toggled ON and OFF correctly.")
        browser.close()

if __name__ == "__main__":
    verify_toggle_back()
