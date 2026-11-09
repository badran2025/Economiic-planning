import { Card, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { fmtEgp } from "@/lib/format";
import type { Totals } from "@/lib/queries";

type RadixColor = "green" | "red" | "blue" | "amber";

const META: Record<keyof Totals, { label: string; color: RadixColor }> = {
  income: { label: "الدخل", color: "green" },
  expenses: { label: "المصروفات", color: "red" },
  investment: { label: "الاستثمار", color: "blue" },
  net: { label: "المتبقّي", color: "amber" },
};

const ORDER: (keyof Totals)[] = ["income", "expenses", "investment", "net"];

export function HeroTotals({ totals }: { totals: Totals }) {
  return (
    <Grid columns={{ initial: "2", sm: "4" }} gap="3">
      {ORDER.map((k) => (
        <Card key={k} size="2">
          <Flex direction="column" gap="1">
            <Flex align="center" gap="2">
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: `var(--${META[k].color}-9)`,
                }}
              />
              <Text size="2" color="gray">
                {META[k].label}
              </Text>
            </Flex>
            <Heading size="7" color={META[k].color} className="num">
              {fmtEgp(totals[k])}
            </Heading>
            <Text size="1" color="gray">
              جنيه مصري
            </Text>
          </Flex>
        </Card>
      ))}
    </Grid>
  );
}

export function TotalsStrip({ totals }: { totals: Totals }) {
  return (
    <Grid columns="2" gapX="4" gapY="1">
      {ORDER.map((k) => (
        <Flex key={k} justify="between" gap="2">
          <Text size="2" color="gray">
            {META[k].label}
          </Text>
          <Text size="2" weight="bold" color={META[k].color} className="num">
            {fmtEgp(totals[k])}
          </Text>
        </Flex>
      ))}
    </Grid>
  );
}
