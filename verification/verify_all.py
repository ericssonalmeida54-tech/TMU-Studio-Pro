import re
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()
    page.goto("http://localhost:3000")

    print("1. Verifying Dashboard...")
    # Dismiss tutorial if present
    if page.get_by_text("Bem-vindo ao TMU Studio Pro").is_visible():
        page.get_by_role("button", name="Começar a Usar").click()

    expect(page.get_by_role("heading", name="TMU Studio", exact=True)).to_be_visible()

    # Task 1: MTM Table
    print("2. Verifying MTM Table...")
    page.get_by_role("button", name="Tabela MTM-1").click()
    expect(page.get_by_text("Tabela de Dados MTM-1")).to_be_visible()
    # Check for specific MTM data (e.g., Reach table headers)
    expect(page.get_by_text("Alcançar (Reach - R)")).to_be_visible()
    page.get_by_role("button", name="Dashboard").click()

    # Task 3: Motion Groups (Standard Operations)
    print("3. Verifying Motion Groups...")
    page.get_by_role("button", name="Operações Padrão").click()
    expect(page.get_by_text("Gerenciador de Operações Padrão")).to_be_visible()

    # Create a new group
    page.get_by_role("button", name="Novo Grupo").click()
    page.get_by_placeholder("Ex: Pegar Parafuso").fill("Grupo Teste Playwright")
    page.get_by_role("button", name="Salvar Grupo").click()
    expect(page.get_by_text("Grupo Teste Playwright")).to_be_visible()
    page.get_by_role("button", name="Voltar para Dashboard").click()

    # Task 5: Sandbox (Simulador Rápido)
    print("4. Verifying Sandbox...")
    page.get_by_role("button", name="Simulador Rápido").click()
    expect(page.get_by_placeholder("Simulador Rápido (Não salva)...")).to_be_visible()

    # Task 4 & 2: Wizard Integration & Process Time
    print("5. Verifying Wizard & Process Time...")
    # Open Wizard (Assistente) if not open (it defaults to open on desktop, but let's check)
    # The button has title "Assistente"
    wizard_btn = page.get_by_title("Assistente")
    if wizard_btn.is_visible():
        wizard_btn.click() # Toggle it to ensure it's open or check state?
        # Assuming it's open or closed. The text "Assistente Visual" should be visible if open.
        # If not, click again.
        if not page.get_by_text("Assistente Visual").is_visible():
            wizard_btn.click()

    expect(page.get_by_text("Assistente Visual")).to_be_visible()

    # Check "Process Time" first (Task 2)
    print("   Testing Process Time...")
    # Click "Processo" category button. It might be an icon button with text inside div.
    # The label is "Processo".
    page.evaluate("Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Processo')).click()")
    expect(page.get_by_text("Descrição da Operação")).to_be_visible()
    expect(page.get_by_text("Tempo", exact=True)).to_be_visible()

    # Go back
    page.evaluate("Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Voltar')).click()")

    # Check "Meus Grupos" (Task 4)
    print("   Testing Motion Groups in Wizard...")

    # Ensure Wizard is open based on button state (color)
    wand_btn = page.get_by_title("Assistente")
    if "bg-red" not in wand_btn.get_attribute("class"):
        print("   Wizard closed (button inactive), reopening...")
        wand_btn.click()
        page.wait_for_timeout(500)

    page.screenshot(path="verification_before_groups.png")
    # Use JS click to avoid potential overlay issues in headless
    page.evaluate("Array.from(document.querySelectorAll('button')).find(el => el.textContent === 'Meus Grupos').click()")

    page.wait_for_timeout(500)
    page.screenshot(path="verification_groups_view.png")

    # Check if we switched view
    expect(page.get_by_placeholder("Buscar grupo...")).to_be_visible()

    # Check for the group
    if page.get_by_text("Nenhum grupo encontrado").is_visible():
        print("Error: Group list is empty!")

    # Scroll to it
    page.get_by_text("Grupo Teste Playwright").scroll_into_view_if_needed()
    expect(page.get_by_text("Grupo Teste Playwright")).to_be_visible()

    print("All checks passed!")
    page.screenshot(path="verification_all.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
