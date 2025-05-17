from autocorrect import Speller

def spell_check(prompt):
    spell = Speller()
    # print(spell("transer monei from accound a to accound B"))
    # print(spell("pls insert 45 eruo from account A to accound B"))
    # print(spell("necesary bsnl accounr statrmrnt"))
    # print(spell("selete user  Y"))
    print(prompt)
    return spell(prompt)