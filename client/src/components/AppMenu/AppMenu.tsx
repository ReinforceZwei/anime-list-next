import { ActionIcon, Affix, Menu, useMantineColorScheme } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconMenu2, IconMoon, IconSun } from "@tabler/icons-react";


export default function AppMenu() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <Affix position={{ top: 10, left: 10 }}>
      <Menu>
        <Menu.Target>
          <ActionIcon variant="white" size="lg" radius="xl" style={(theme) => ({ boxShadow: theme.shadows.md })} aria-label="Menu">
            <IconMenu2 />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            leftSection={isDark ? <IconSun size={16} /> : <IconMoon size={16} />}
            onClick={toggleColorScheme}
          >
            {isDark ? 'Light mode' : 'Dark mode'}
          </Menu.Item>
          <Menu.Item onClick={() => modals.openContextModal({ modal: 'manageTags', title: 'Manage Tags', innerProps: {} })}>
            Tags
          </Menu.Item>
          <Menu.Item>Settings</Menu.Item>
          <Menu.Item>Search TMDB</Menu.Item>
          <Menu.Item>Logout</Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Affix>
  )
}