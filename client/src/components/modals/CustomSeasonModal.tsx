import { useState } from "react";
import {
  Autocomplete,
  Button,
  Modal,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import type { ContextModalProps } from "@/lib/modalStack";
import { useAnimeMutation } from "@/hooks/useAnimeMutation";
import type { TmdbTvDetailResult } from "@/types/tmdb";

const CUSTOM_SEASON_PRESETS = ["第1期", "第2期", "第3期", "第4期", "第5期"];

export type CustomSeasonInnerProps = {
  detail: Pick<TmdbTvDetailResult, "id" | "name" | "seasons">;
  onSaved?: (id: string) => void;
};

export function CustomSeasonModal({
  id,
  context,
  innerProps,
  title,
  modalProps,
}: ContextModalProps<CustomSeasonInnerProps>) {
  const { detail, onSaved } = innerProps;
  const { createMutation } = useAnimeMutation();

  const [label, setLabel] = useState("");

  const baseSeasonOptions = detail.seasons.map((s) => ({
    value: String(s.season_number),
    label: `${s.name} (${s.episode_count} 集)`,
  }));

  const defaultSeason =
    baseSeasonOptions.find((o) => o.value === "1")?.value ??
    baseSeasonOptions[0]?.value ??
    null;

  const [baseSeason, setBaseSeason] = useState<string | null>(defaultSeason);

  function handleCreate() {
    if (!baseSeason) return;
    const season = detail.seasons.find(
      (s) => String(s.season_number) === baseSeason,
    );
    if (!season) return;

    if (!label) return;

    createMutation.mutate(
      {
        tmdbId: detail.id,
        tmdbMediaType: "tv",
        tmdbSeasonNumber: season.season_number,
        customName: `${detail.name} ${label}`,
      },
      {
        onSuccess: (record) => {
          context.closeModal(id);
          onSaved?.(record.id);
        },
      },
    );
  }

  return (
    <Modal title={title} {...modalProps}>
      <Stack gap="md">
        <Text fw={600} size="md" lineClamp={2}>
          {detail.name}
        </Text>
        <Autocomplete
          label="季度名稱"
          placeholder="選擇或輸入季度"
          data={CUSTOM_SEASON_PRESETS}
          value={label}
          onChange={setLabel}
        />
        <Select
          label="以此季度為基礎"
          placeholder="選擇季度"
          data={baseSeasonOptions}
          value={baseSeason}
          onChange={setBaseSeason}
        />
        <Button
          variant="light"
          leftSection={<IconPlus size="1em" />}
          loading={createMutation.isPending}
          disabled={!baseSeason || !label}
          onClick={handleCreate}
        >
          建立紀錄
        </Button>
      </Stack>
    </Modal>
  );
}
