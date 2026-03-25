import { ActionIcon, Affix, Menu, useMantineColorScheme } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconLogout, IconMenu2, IconMoon, IconSettings, IconSun, IconTag } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";


export default function AppMenu() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const isDark = colorScheme === 'dark'
  const navigate = useNavigate()

  return (
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
        <Menu.Item
          leftSection={<IconTag size={16} />}
          onClick={() => modals.openContextModal({ modal: 'manageTags', title: 'Manage Tags', innerProps: {} })}
        >
          Tags
        </Menu.Item>
        <Menu.Item
          leftSection={<IconSettings size={16} />}
          onClick={() => modals.openContextModal({ modal: 'preferences', title: 'Preferences', innerProps: {} })}
        >
          Settings
        </Menu.Item>
        <Menu.Item
          leftSection={<IconLogout size={16} />}
          color="red"
          onClick={() => navigate({ to: '/logout' })}
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}