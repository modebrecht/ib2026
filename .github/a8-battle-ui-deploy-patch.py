from pathlib import Path

path = Path('.github/workflows/pages-multibranch.yml')
text = path.read_text(encoding='utf-8')

old_sha = 'e64d49559f3cb5cb2a8f8214402586f1ad0da4b8'
new_sha = '228a4ef4217e65a1169525693670d085ed99bdc4'
if old_sha not in text:
    raise SystemExit('old Shortcut Quest pin not found')
text = text.replace(old_sha, new_sha)
text = text.replace('e64d4955', '228a4ef4')

contract_anchor = "          grep -Fq 'SHORTCUT_QUEST_BATTLE_ENGINE_V2' _site/dev/tk2/A8/index.html\n"
contract_add = contract_anchor + "          grep -Fq 'BATTLE UI SKILL BAR PREMIUM PASS 2026' _site/dev/tk2/A8/modern-battle.css\n          grep -Fq 'BATTLE UI SKILL CARD FIT FIX 2026' _site/dev/tk2/A8/modern-battle.css\n"
if 'BATTLE UI SKILL BAR PREMIUM PASS 2026' not in text:
    if contract_anchor not in text:
        raise SystemExit('build contract anchor not found')
    text = text.replace(contract_anchor, contract_add, 1)

seed_anchor = "                  equipment: {}\n                }));"
seed_replacement = """                  equipment: {},
                  skills: [
                    { key: 'shield_wall', name: 'Alles markieren', icon: 'shield', effect: 'defense', power: 4, description: 'Erhöht DEF um 4 für 5 gegnerische Angriffe.' },
                    { key: 'heal', name: 'Drucken', icon: 'heal', effect: 'heal', power: 12, description: 'Heilt 12 HP.' },
                    { key: 'strike', name: 'Kopieren', icon: 'lightning', effect: 'damage', power: 6, description: 'Fügt sofort 6 Schaden zu.' },
                    { key: 'frenzy', name: 'Suchen', icon: 'target', effect: 'attack', power: 2, description: 'Erhöht ATK um 2 für 5 gegnerische Angriffe.' }
                  ]
                }));"""
if "name: 'Alles markieren'" not in text:
    if seed_anchor not in text:
        raise SystemExit('seed anchor not found')
    text = text.replace(seed_anchor, seed_replacement, 1)

active_anchor = """              assert.equal(active.pageOverflow, false, 'Active battle page must not overflow horizontally');

              // Battle V2 regression:"""
skill_checks = """              assert.equal(active.pageOverflow, false, 'Active battle page must not overflow horizontally');

              // Battle UI regression: the active fight must expose four compact, readable,
              // unclipped ability cards rather than the old tall dark placeholders.
              const skillUi = await page.locator('#battleSkillBar').evaluate(bar => {
                const cards = Array.from(bar.querySelectorAll('.battle-skill'));
                const rect = el => el?.getBoundingClientRect();
                return {
                  display: getComputedStyle(bar).display,
                  cards: cards.map(card => {
                    const icon = card.querySelector('.battle-skill-icon');
                    const desc = card.querySelector('.battle-skill-desc');
                    const button = card.querySelector('button');
                    return {
                      width: rect(card)?.width || 0,
                      height: rect(card)?.height || 0,
                      iconWidth: rect(icon)?.width || 0,
                      iconHeight: rect(icon)?.height || 0,
                      descHeight: rect(desc)?.height || 0,
                      buttonHeight: rect(button)?.height || 0,
                      clipped: card.scrollHeight > card.clientHeight + 2
                    };
                  }),
                  pageOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
                };
              });
              assert.equal(skillUi.display, 'grid', 'Deployed Battle skills must use the redesigned grid');
              assert.equal(skillUi.cards.length, 4, 'Deployed seeded battle must show four skill cards');
              assert.ok(skillUi.cards.every(card => card.width >= 210), 'Desktop Battle skill cards must remain readable');
              assert.ok(skillUi.cards.every(card => card.height >= 120 && card.height <= 190), 'Battle skill cards must stay compact');
              assert.ok(skillUi.cards.every(card => card.iconWidth >= 40 && card.iconHeight >= 40), 'Battle skill icons must be prominent');
              assert.ok(skillUi.cards.every(card => card.descHeight >= 28), 'Battle skill effect copy must stay visible');
              assert.ok(skillUi.cards.every(card => card.buttonHeight >= 70), 'Battle skill buttons must remain comfortably tappable');
              assert.ok(skillUi.cards.every(card => !card.clipped), 'Battle skill content must never be clipped');
              assert.equal(skillUi.pageOverflow, false, 'Battle skill grid must not create page overflow');

              // Battle V2 regression:"""
if 'Deployed Battle skills must use the redesigned grid' not in text:
    if active_anchor not in text:
        raise SystemExit('active battle assertion anchor not found')
    text = text.replace(active_anchor, skill_checks, 1)

path.write_text(text, encoding='utf-8')
