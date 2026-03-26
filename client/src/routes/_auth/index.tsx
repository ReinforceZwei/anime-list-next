import { createFileRoute } from "@tanstack/react-router";
import { useAnimeSections } from "@/hooks/useAnimeSections";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useScrollToRecord } from "@/hooks/useScrollToRecord";
import type { AnimeRecord, SectionDef } from "@/types/anime";
import {
  Affix,
  Button,
  Center,
  Stack,
  Loader,
  Paper,
  ThemeIcon,
  Text,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconAlertTriangle } from "@tabler/icons-react";
import AnimePaper from "@/components/AnimePaper/AnimePaper";
import AppMenu from "@/components/AppMenu/AppMenu";
import AnimeCard from "@/components/InfoCard/AnimeCard";
import ElevatorWidget from "@/components/ElevatorWidget/ElevatorWidget";
import { LocalSearch } from "@/components/LocalSearch/LocalSearch";
import { useMemo, useRef, useState } from "react";
import { useDocumentTitle } from "@mantine/hooks";

export const Route = createFileRoute("/_auth/")({
  component: Index,
});

function Index() {
  const { data: prefs } = useUserPreferences();
  const sectionDefs = useMemo<SectionDef[]>(
    () => [
      {
        key: "watching",
        label: prefs?.watchingLabel || "觀看中",
        statuses: ["watching"],
        sortBy: "updated",
        sortOrder: "desc",
      },
      {
        key: "completed",
        label: prefs?.completedLabel || "已看完",
        statuses: ["completed"],
        sortBy: "completedAt",
        sortOrder: "asc",
      },
      {
        key: "planned",
        label: prefs?.plannedLabel || "計畫中",
        statuses: ["planned"],
        sortBy: "created",
        sortOrder: "asc",
      },
      {
        key: "dropped",
        label: prefs?.droppedLabel || "已棄番",
        statuses: ["dropped"],
        sortBy: "updated",
        sortOrder: "desc",
      },
    ],
    [prefs],
  );

  const { sections, isLoading, isError, error } = useAnimeSections(sectionDefs);
  const [selectedAnimeId, setSelectedAnimeId] = useState<string | null>(null);
  const pageTitle = prefs?.pageTitle || "動漫清單";
  const markerRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const { getRef, jumpTo } = useScrollToRecord();

  useDocumentTitle(pageTitle);

  function openTmdbModal() {
    modals.openContextModal({
      modal: "tmdbSearch",
      title: "搜尋 TMDb",
      size: "56rem",
      innerProps: { onSaved: jumpTo },
    });
  }

  function handleAnimeClick(anime: AnimeRecord) {
    setSelectedAnimeId(anime.id);
  }

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader size="xl" type="dots" />
      </Center>
    );
  }

  if (isError) {
    return (
      <Center h="100vh">
        <Paper
          p="xl"
          radius="md"
          withBorder
          w={360}
          style={{ textAlign: "center" }}
        >
          <Stack align="center" gap="md">
            <ThemeIcon size={48} radius="xl" color="red" variant="light">
              <IconAlertTriangle size={26} />
            </ThemeIcon>
            <Text fw={600} size="lg">
              發生錯誤
            </Text>
            <Text c="dimmed" size="sm">
              {error.message}
            </Text>
            <Button
              variant="light"
              color="red"
              fullWidth
              onClick={() => window.location.reload()}
            >
              重新載入
            </Button>
          </Stack>
        </Paper>
      </Center>
    );
  }

  return (
    <div>
      <Affix position={{ top: 10, left: 10 }}>
        <AppMenu />
      </Affix>
      <AnimePaper>
        <AnimePaper.Title>{pageTitle}</AnimePaper.Title>
        {sections.map((section, i) => (
          <div key={section.key}>
            <AnimePaper.Subtitle
              ref={(el) => {
                markerRefs.current[i] = el;
              }}
            >
              {section.label}
            </AnimePaper.Subtitle>
            <AnimePaper.List>
              {section.items.map((anime) => (
                <AnimePaper.Item
                  key={anime.id}
                  record={anime}
                  onClick={handleAnimeClick}
                  itemRef={getRef(anime.id)}
                />
              ))}
            </AnimePaper.List>
          </div>
        ))}
      </AnimePaper>
      <Affix position={{ top: 10, right: 10 }}>
        <LocalSearch jumpTo={jumpTo} />
      </Affix>
      <Affix position={{ top: 10, right: 10 }}>
        {selectedAnimeId && (
          <AnimeCard
            animeId={selectedAnimeId}
            onClose={() => setSelectedAnimeId(null)}
            onJumpTo={jumpTo}
          />
        )}
      </Affix>
      <Affix position={{ bottom: 10, right: 10 }}>
        <Button onClick={openTmdbModal}>搜尋 TMDb</Button>
      </Affix>
      <ElevatorWidget markerRefs={markerRefs.current} />
    </div>
  );
}
