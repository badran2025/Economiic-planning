import Link from "next/link";
import { Box, Button, Card, Flex, Grid, Heading, Text, TextField } from "@radix-ui/themes";
import {
  getCategories,
  getGrandTotals,
  getInvestmentDestinations,
  getPeople,
  getYearsWithTotals,
} from "@/lib/queries";
import { HeroTotals, TotalsStrip } from "@/components/Totals";
import { SetupNotice } from "@/components/SetupNotice";
import QuickAdd from "@/components/QuickAdd";
import {
  addExpenseEntry,
  addIncomeEntry,
  addInvestmentEntry,
  addYear,
  loadDefaults,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let totals, years, people, categories, destinations;
  try {
    [totals, years, people, categories, destinations] = await Promise.all([
      getGrandTotals(),
      getYearsWithTotals(),
      getPeople(),
      getCategories(),
      getInvestmentDestinations(),
    ]);
  } catch (e) {
    return <SetupNotice detail={e instanceof Error ? e.message : String(e)} />;
  }

  const peopleOpts = people.filter((p) => p.active).map((p) => ({ id: p.id, name: p.name }));
  const categoryOpts = categories.filter((c) => c.active).map((c) => ({ id: c.id, name: c.name }));
  const destOpts = destinations.filter((d) => d.active).map((d) => ({ id: d.id, name: d.name }));
  const nextYear = new Date().getFullYear();

  return (
    <Flex direction="column" gap="6">
      <Box>
        <Heading size="6" mb="1">الملخّص الإجمالي</Heading>
        <Text color="gray" size="2" mb="4" as="p">
          كل الأرقام بالجنيه المصري، ومجمّعة تلقائياً من كل الشهور والسنين.
        </Text>
        <HeroTotals totals={totals} />
      </Box>

      <QuickAdd
        people={peopleOpts}
        categories={categoryOpts}
        destinations={destOpts}
        addIncome={addIncomeEntry}
        addExpense={addExpenseEntry}
        addInvestment={addInvestmentEntry}
      />

      <Box>
        <Flex align="center" justify="between" wrap="wrap" gap="3" mb="3">
          <Heading size="5">السنوات</Heading>
          <form action={addYear}>
            <Flex gap="2">
              <TextField.Root
                type="number"
                name="year"
                defaultValue={nextYear}
                min={2000}
                max={2100}
                style={{ width: 120 }}
                aria-label="السنة"
              />
              <Button type="submit">+ إضافة سنة</Button>
            </Flex>
          </form>
        </Flex>

        {years.length === 0 ? (
          <Card size="3">
            <Flex direction="column" align="center" gap="3" py="4">
              <Text color="gray">مفيش سنين لسه. أضف سنة من فوق عشان تبدأ.</Text>
              <form action={loadDefaults}>
                <Button type="submit" variant="soft">
                  تحميل التصنيفات الافتراضية
                </Button>
              </form>
              <Text size="1" color="gray">
                اختياري — تقدر تعدّلها أو تحذفها بعدين من الإعدادات.
              </Text>
            </Flex>
          </Card>
        ) : (
          <Grid columns={{ initial: "1", xs: "2", md: "3" }} gap="3">
            {years.map((y) => (
              <Card key={y.year} size="2" asChild>
                <Link href={`/year/${y.year}`}>
                  <Flex direction="column" gap="3">
                    <Flex align="baseline" justify="between">
                      <Heading size="6">{y.year}</Heading>
                      <Text size="1" color="gray">عرض الشهور ←</Text>
                    </Flex>
                    <TotalsStrip totals={y} />
                  </Flex>
                </Link>
              </Card>
            ))}
          </Grid>
        )}
      </Box>
    </Flex>
  );
}
