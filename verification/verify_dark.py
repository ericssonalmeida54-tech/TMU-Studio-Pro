import time
import os
from playwright.sync_api import sync_playwright

def verify_dark_and_config():
    # Ensure directory exists
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

        # Toggle Dark Mode
        print("Toggling dark mode...")
        # Sidebar footer button
        page.locator("aside .border-t button").last.click()
        time.sleep(1)

        is_dark = page.evaluate("document.documentElement.classList.contains('dark')")
        print(f"Dark mode active: {is_dark}")

        # Save relative to CWD
        page.screenshot(path="verification/dark_dashboard.png")

        # Create New Study
        print("Creating new study...")
        page.get_by_text("Novo Estudo").click()
        time.sleep(1)

        # Navigate to Config Tab
        print("Navigating to Config...")
        # Look for the container with overflow-x-auto (the tab bar) and click the first button (Config icon)
        page.locator(".overflow-x-auto button").first.click()
        time.sleep(1)

        # Verify Config Fields
        print("Verifying config fields...")
        page.screenshot(path="verification/dark_config.png")

        has_min_per_hour = page.get_by_text("Minutos Produtivos por Hora").is_visible()
        print(f"Has 'Minutos Produtivos por Hora': {has_min_per_hour}")

        has_target = page.get_by_text("Meta de Aumento de Produção (%)").is_visible()
        print(f"Has 'Meta de Aumento de Produção': {has_target}")

        browser.close()

if __name__ == "__main__":
    verify_dark_and_config()
