"use client";

import { useEffect, useState } from "react";
import { Box, Button, Checkbox, Dialog, Flex, Text, TextField } from "@radix-ui/themes";
import { computeEgp, fmtEgp, toNum } from "@/lib/format";

export type GItem = {
  key: string;
  label: string;
  currency: string;
  original: string;
  rate: string;
  personId: number | null;
  categoryId: number | null;
  sourceId: number | null;
};

type Row = GItem & { selected: boolean };
type RadixColor = "green" | "red";

export default function GenerateRecurring({
  triggerLabel,
  title,
  color,
  items,
  emptyText,
  disabled,
  onConfirm,
}: {
  triggerLabel: string;
  title: string;
  color: RadixColor;
  items: GItem[];
  emptyText: string;
  disabled?: boolean;
  onConfirm: (rows: GItem[]) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setRows(items.map((it) => ({ ...it, selected: true })));
  }, [open, items]);

  function update(key: string, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  const selectedRows = rows.filter((r) => r.selected);
  const allSelected = rows.length > 0 && selectedRows.length === rows.length;
  const someSelected = selectedRows.length > 0 && !allSelected;
  const total = selectedRows.reduce(
    (a, r) => a + computeEgp(toNum(r.original), r.currency === "EGP" ? 1 : toNum(r.rate) || 0),
    0
  );

  function toggleAll(v: boolean) {
    setRows((rs) => rs.map((r) => ({ ...r, selected: v })));
  }

  async function confirm() {
    setSaving(true);
    try {
      await onConfirm(
        selectedRows.map((r) => ({
          key: r.key,
          label: r.label,
          currency: r.currency,
          original: r.original,
          rate: r.rate,
          personId: r.personId,
          categoryId: r.categoryId,
          sourceId: r.sourceId,
        }))
      );
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button type="button" variant="soft" color={color} disabled={disabled}>
          ⟳ {triggerLabel}
        </Button>
      </Dialog.Trigger>
      <Dialog.Content maxWidth="560px">
        <Dialog.Title size="4">{title}</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="3">
          اختار البنود اللي عايز تضيفها، وتقدر تعدّل المبالغ قبل الإضافة.
        </Dialog.Description>

        {rows.length === 0 ? (
          <Text color="gray" size="2">{emptyText}</Text>
        ) : (
          <>
            <Flex align="center" justify="between" mb="2">
              <Text as="label" size="2" weight="bold">
                <Flex align="center" gap="2">
                  <Checkbox
                    checked={allSelected ? true : someSelected ? "indeterminate" : false}
                    onCheckedChange={(v) => toggleAll(v === true)}
                  />
                  تحديد الكل
                </Flex>
              </Text>
              <Text size="2" color="gray">
                الإجمالي:{" "}
                <Text weight="bold" color={color} className="num">
                  {fmtEgp(total)} EGP
                </Text>
              </Text>
            </Flex>

            <Flex direction="column" gap="2" style={{ maxHeight: "50vh", overflowY: "auto" }}>
              {rows.map((r) => {
                const rEgp = computeEgp(toNum(r.original), r.currency === "EGP" ? 1 : toNum(r.rate) || 0);
                return (
                  <Flex
                    key={r.key}
                    align="center"
                    gap="2"
                    wrap="wrap"
                    style={{
                      background: r.selected ? "var(--gray-2)" : "transparent",
                      border: "1px solid var(--gray-a4)",
                      borderRadius: "var(--radius-3)",
                      padding: "8px 10px",
                      opacity: r.selected ? 1 : 0.55,
                    }}
                  >
                    <Checkbox
                      checked={r.selected}
                      onCheckedChange={(v) => update(r.key, { selected: v === true })}
                    />
                    <Box style={{ flex: "2 1 140px" }}>
                      <TextField.Root
                        value={r.label}
                        onChange={(e) => update(r.key, { label: e.target.value })}
                        size="2"
                      />
                    </Box>
                    <Box style={{ flex: "1 1 90px" }}>
                      <TextField.Root
                        type="text"
                        inputMode="decimal"
                        value={r.original}
                        onChange={(e) => update(r.key, { original: e.target.value })}
                        size="2"
                      >
                        <TextField.Slot side="right">{r.currency}</TextField.Slot>
                      </TextField.Root>
                    </Box>
                    {r.currency !== "EGP" && (
                      <Box style={{ flex: "1 1 70px" }}>
                        <TextField.Root
                          type="text"
                          inputMode="decimal"
                          placeholder="سعر"
                          value={r.rate}
                          onChange={(e) => update(r.key, { rate: e.target.value })}
                          size="2"
                        />
                      </Box>
                    )}
                    <Text size="2" weight="bold" className="num" style={{ minWidth: 86, textAlign: "left" }}>
                      {fmtEgp(rEgp)} EGP
                    </Text>
                  </Flex>
                );
              })}
            </Flex>
          </>
        )}

        <Flex justify="end" gap="2" mt="4">
          <Dialog.Close>
            <Button type="button" variant="soft" color="gray">إلغاء</Button>
          </Dialog.Close>
          <Button
            type="button"
            color={color}
            disabled={saving || selectedRows.length === 0}
            onClick={confirm}
          >
            اعتماد وإضافة ({selectedRows.length})
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
