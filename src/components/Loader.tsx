export default function Loader() {
  return (
    <>
      <style>
        {`
      .container {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        height: var(--uib-size);
        width: var(--uib-size);
        animation: rotate calc(var(--uib-speed) * 1.667) infinite linear !important;
      }

      .container::before,
      .container::after {
        content: '';
        position: absolute;
        height: 60%;
        width: 60%;
        border-radius: 50%;
        background-color: var(--uib-color);
        flex-shrink: 0;
      }

      .container::before {
        animation: orbit var(--uib-speed) linear infinite !important;
      }

      .container::after {
        animation: orbit var(--uib-speed) linear calc(var(--uib-speed) / -2) infinite !important;
      }

      @keyframes rotate {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      @keyframes orbit {
        0% {
          transform: translate(calc(var(--uib-size) * 0.5)) scale(0.73684);
          opacity: 0.65;
        }

        5% {
          transform: translate(calc(var(--uib-size) * 0.4)) scale(0.684208);
          opacity: 0.58;
        }
        10% {
          transform: translate(calc(var(--uib-size) * 0.3)) scale(0.631576);
          opacity: 0.51;
        }
        15% {
          transform: translate(calc(var(--uib-size) * 0.2)) scale(0.578944);
          opacity: 0.44;
        }
        20% {
          transform: translate(calc(var(--uib-size) * 0.1)) scale(0.526312);
          opacity: 0.37;
        }
        25% {
          transform: translate(0%) scale(0.47368);
          opacity: 0.3;
        }

        30% {
          transform: translate(calc(var(--uib-size) * -0.1)) scale(0.526312);
          opacity: 0.37;
        }
        35% {
          transform: translate(calc(var(--uib-size) * -0.2)) scale(0.578944);
          opacity: 0.44;
        }
        40% {
          transform: translate(calc(var(--uib-size) * -0.3)) scale(0.631576);
          opacity: 0.51;
        }
        45% {
          transform: translate(calc(var(--uib-size) * -0.4)) scale(0.684208);
          opacity: 0.58;
        }
        50% {
          transform: translate(calc(var(--uib-size) * -0.5)) scale(0.73684);
          opacity: 0.65;
        }

        55% {
          transform: translate(calc(var(--uib-size) * -0.4)) scale(0.789472);
          opacity: 0.72;
        }
        60% {
          transform: translate(calc(var(--uib-size) * -0.3)) scale(0.842104);
          opacity: 0.79;
        }
        65% {
          transform: translate(calc(var(--uib-size) * -0.2)) scale(0.894736);
          opacity: 0.86;
        }
        70% {
          transform: translate(calc(var(--uib-size) * -0.1)) scale(0.947368);
          opacity: 0.93;
        }
        75% {
          transform: translate(0%) scale(1);
          opacity: 1;
        }

        80% {
          transform: translate(calc(var(--uib-size) * 0.1)) scale(0.947368);
          opacity: 0.93;
        }
        85% {
          transform: translate(calc(var(--uib-size) * 0.2)) scale(0.894736);
          opacity: 0.86;
        }
        90% {
          transform: translate(calc(var(--uib-size) * 0.3)) scale(0.842104);
          opacity: 0.79;
        }
        95% {
          transform: translate(calc(var(--uib-size) * 0.4)) scale(0.789472);
          opacity: 0.72;
        }

        100% {
          transform: translate(calc(var(--uib-size) * 0.5)) scale(0.73684);
          opacity: 0.65;
        }
      }
      `}
      </style>
      <div
        class={"container"}
        style={{
          "--uib-size": 15 + "px",
          "--uib-color": "black",
          "--uib-speed": 1.5 + "s",
        }}
      ></div>
    </>
  )
}
