(function () {
  'use strict';

  const STYLE_ID = 'a8BattleContinuityStyles';
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    /* A8 BATTLE CONTINUITY PASS 2026
       Keep pre-battle and active-battle character scale visually consistent,
       and keep both swords seated at the knight's hands. */

    /* PRE-BATTLE: the previous calc(... + 132px) pushed the hilts almost to
       the floor. Anchor the weapon wrappers to the hand line instead. */
    #battleView .battle-stage-preview .battle-side.hero .a8-arena-weapon {
      top: 61% !important;
      bottom: auto !important;
      width: clamp(70px, 7.2vw, 84px) !important;
      height: clamp(92px, 8.6vw, 108px) !important;
      transform-origin: 50% 10% !important;
    }
    #battleView .battle-stage-preview .battle-side.hero .a8-arena-weapon.weapon-left {
      left: 23% !important;
      right: auto !important;
    }
    #battleView .battle-stage-preview .battle-side.hero .a8-arena-weapon.weapon-right {
      right: 23% !important;
      left: auto !important;
    }

    /* ACTIVE BATTLE: match the same visual scale used by the 56%-high
       pre-battle portraits instead of shrinking to the old 230px arena. */
    #battleView .battle-card.a8-battle-active .battle-arena,
    #battleView #battleArena {
      height: clamp(420px, 40vw, 520px) !important;
      min-height: 420px !important;
    }

    #battleView .battle-arena .fighter.knight {
      left: 21% !important;
      bottom: 5.5% !important;
      width: 260px !important;
      height: 360px !important;
    }
    #battleView .battle-arena .fighter.enemy {
      right: 21% !important;
      bottom: 5.5% !important;
      width: 260px !important;
      height: 350px !important;
    }
    #battleView .battle-arena .fighter.knight .fighter-sprite {
      height: clamp(280px, 26.88vw, 347px) !important;
    }
    #battleView .battle-arena .fighter.enemy .fighter-sprite {
      height: clamp(270px, 26vw, 335px) !important;
    }
    #battleView .battle-arena .fighter::after {
      width: 184px !important;
      height: 28px !important;
    }

    /* Active-battle swords scale with the larger knight and keep their grip
       point at the gauntlets. */
    #battleView .battle-arena .fighter.knight .battle-weapon-slot {
      width: 88px !important;
      height: 108px !important;
      bottom: 10px !important;
      transform-origin: 50% 10% !important;
    }
    #battleView .battle-arena .fighter.knight .battle-weapon-slot.weapon-left {
      left: 35px !important;
      right: auto !important;
    }
    #battleView .battle-arena .fighter.knight .battle-weapon-slot.weapon-right {
      right: 33px !important;
      left: auto !important;
    }

    /* Enemy-held gear must stay proportional after the scale correction. */
    #battleView .a8-enemy-item {
      width: 88px !important;
      height: 88px !important;
      bottom: 82px !important;
    }
    #battleView .a8-enemy-item[data-kind='shield'] {
      width: 94px !important;
      height: 94px !important;
      bottom: 102px !important;
    }
    #battleView .a8-enemy-item[data-kind='focus'],
    #battleView .a8-enemy-item[data-kind='heal'] {
      width: 60px !important;
      height: 60px !important;
      bottom: 158px !important;
    }

    @media (max-width: 720px) {
      #battleView .battle-stage-preview .battle-side.hero .a8-arena-weapon {
        top: 62% !important;
        width: clamp(56px, 15vw, 70px) !important;
        height: clamp(74px, 18vw, 90px) !important;
      }
      #battleView .battle-stage-preview .battle-side.hero .a8-arena-weapon.weapon-left { left: 19% !important; }
      #battleView .battle-stage-preview .battle-side.hero .a8-arena-weapon.weapon-right { right: 19% !important; }

      #battleView .battle-card.a8-battle-active .battle-arena,
      #battleView #battleArena {
        height: 360px !important;
        min-height: 360px !important;
      }
      #battleView .battle-arena .fighter.knight {
        left: 17% !important;
        width: 196px !important;
        height: 282px !important;
      }
      #battleView .battle-arena .fighter.enemy {
        right: 17% !important;
        width: 196px !important;
        height: 270px !important;
      }
      #battleView .battle-arena .fighter.knight .fighter-sprite { height: 272px !important; }
      #battleView .battle-arena .fighter.enemy .fighter-sprite { height: 258px !important; }
      #battleView .battle-arena .fighter.knight .battle-weapon-slot {
        width: 68px !important;
        height: 86px !important;
        bottom: 7px !important;
      }
      #battleView .battle-arena .fighter.knight .battle-weapon-slot.weapon-left { left: 26px !important; }
      #battleView .battle-arena .fighter.knight .battle-weapon-slot.weapon-right { right: 24px !important; }
    }

    @media (max-width: 460px) {
      #battleView .battle-card.a8-battle-active .battle-arena,
      #battleView #battleArena {
        height: 315px !important;
        min-height: 315px !important;
      }
      #battleView .battle-arena .fighter.knight {
        left: 15% !important;
        width: 162px !important;
        height: 238px !important;
      }
      #battleView .battle-arena .fighter.enemy {
        right: 15% !important;
        width: 162px !important;
        height: 228px !important;
      }
      #battleView .battle-arena .fighter.knight .fighter-sprite { height: 230px !important; }
      #battleView .battle-arena .fighter.enemy .fighter-sprite { height: 218px !important; }
      #battleView .battle-arena .fighter.knight .battle-weapon-slot {
        width: 58px !important;
        height: 74px !important;
        bottom: 5px !important;
      }
      #battleView .battle-arena .fighter.knight .battle-weapon-slot.weapon-left { left: 20px !important; }
      #battleView .battle-arena .fighter.knight .battle-weapon-slot.weapon-right { right: 18px !important; }
    }
  `;
  document.head.appendChild(style);

  window.A8_BATTLE_CONTINUITY = Object.freeze({ version: 1 });
})();
