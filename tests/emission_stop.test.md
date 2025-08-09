# Emission stop-condition (0.5% weekly)

With DECIMALS=6 (micro-units), MIN_UNIT=1 micro, and initial treasury of 20,000,000:
- pot = floor(balance / 200)
- stop when pot < 1 micro

Expected scale:
- epochs_until_stop ≈ 5169 (~99.4 years)
- final dust remains unspendable due to floor() and MIN_UNIT
