import { createFileRoute } from "@tanstack/react-router";
import { useAnimeSections } from "@/hooks/useAnimeSections";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useScrollToRecord } from "@/hooks/useScrollToRecord";
import type { AnimeRecord, SectionDef } from "@/types/anime";
import { DEFAULT_SECTIONS } from "@/types/anime";
import {
  Affix,
  ActionIcon,
  Button,
  Center,
  Stack,
  Loader,
  Paper,
  ThemeIcon,
  Text,
} from "@mantine/core";
import { modals } from '@/lib/modalStack';
import { IconAlertTriangle, IconPlus, IconFilterOff } from "@tabler/icons-react";
import AnimePaper from "@/components/AnimePaper/AnimePaper";
import AppMenu from "@/components/AppMenu/AppMenu";
import AnimeCard from "@/components/InfoCard/AnimeCard";
import ElevatorWidget from "@/components/ElevatorWidget/ElevatorWidget";
import { LocalSearch } from "@/components/LocalSearch/LocalSearch";
import { FilterPopover } from "@/components/FilterPopover/FilterPopover";
import { evaluateFilter } from "@/lib/filterEngine";
import type { FilterExpression } from "@/types/filter";
import { useMemo, useRef, useState } from "react";
import { useDocumentTitle } from "@mantine/hooks";

export const Route = createFileRoute("/_auth/")({
  component: Index,
});

function Index() {
  const { data: prefs } = useUserPreferences();
  const sectionDefs = useMemo<SectionDef[]>(() => {
    if (prefs?.sections && prefs.sections.length > 0) {
      return prefs.sections
    }
    return DEFAULT_SECTIONS
  }, [prefs]);

  const { sections, isLoading, isError, error } = useAnimeSections(sectionDefs);
  const [selectedAnimeId, setSelectedAnimeId] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState<FilterExpression | null>(null);
  const pageTitle = prefs?.pageTitle || "動漫清單";
  const markerRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const { getRef, jumpTo } = useScrollToRecord();

  // Apply global filter on top of sections
  const filteredSections = useMemo(() => {
    if (!globalFilter) return sections;
    return sections.map((section) => ({
      ...section,
      items: section.items.filter((item) => evaluateFilter(globalFilter, item)),
    }));
  }, [sections, globalFilter]);

  useDocumentTitle(pageTitle);

  function openTmdbModal() {
    modals.openContextModal({
      modal: "tmdbSearch",
      title: "搜尋 TMDb",
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
              <IconAlertTriangle size="2em" />
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
        {filteredSections.map((section, i) => (
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
      <Affix position={{ top: 10, right: 10 }} style={{ display: 'flex', gap: 8 }}>
        <LocalSearch jumpTo={jumpTo} />
        <FilterPopover value={globalFilter} onChange={setGlobalFilter} />
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
      <Affix position={{ bottom: 10, right: 10 }} style={{ paddingBlockEnd: 'env(safe-area-inset-bottom)', display: 'flex', gap: 8 }}>
        {globalFilter && (
          <ActionIcon
            variant="white"
            size="lg"
            radius="xl"
            color="blue"
            style={(theme) => ({ boxShadow: theme.shadows.md })}
            aria-label="清除篩選"
            onClick={() => setGlobalFilter(null)}
          >
            <IconFilterOff size="1.2em" />
          </ActionIcon>
        )}
        <ActionIcon variant="white" size="lg" radius="xl" style={(theme) => ({ boxShadow: theme.shadows.md })} aria-label="搜尋 TMDb" onClick={openTmdbModal}>
          <IconPlus size="1.5em" />
        </ActionIcon>
      </Affix>
      <ElevatorWidget markerRefs={markerRefs.current} />
    </div>
  );
}
