import { ActionIcon, Menu, useMantineColorScheme } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { IconLogout, IconMenu2, IconMoon, IconRefresh, IconSettings, IconSun, IconTag } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";


export default function AppMenu() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const isDark = colorScheme === 'dark'
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  async function handleRefresh() {
    await queryClient.refetchQueries()
    notifications.show({ message: '資料已重新整理', color: 'teal' })
  }

  return (
    <Menu>
      <Menu.Target>
        <ActionIcon variant="white" size="lg" radius="xl" style={(theme) => ({ boxShadow: theme.shadows.md })} aria-label="選單">
          <IconMenu2 />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconRefresh size={16} />}
          onClick={handleRefresh}
        >
          重新整理
        </Menu.Item>
        <Menu.Item
          leftSection={isDark ? <IconSun size={16} /> : <IconMoon size={16} />}
          onClick={toggleColorScheme}
        >
          {isDark ? '淺色模式' : '深色模式'}
        </Menu.Item>
        <Menu.Item
          leftSection={<IconTag size={16} />}
          onClick={() => modals.openContextModal({ modal: 'manageTags', title: '管理標籤', innerProps: {} })}
        >
          標籤
        </Menu.Item>
        <Menu.Item
          leftSection={<IconSettings size={16} />}
          onClick={() => modals.openContextModal({ modal: 'preferences', title: '偏好設定', innerProps: {} })}
        >
          設定
        </Menu.Item>
        <Menu.Item
          leftSection={<IconLogout size={16} />}
          color="red"
          onClick={() => navigate({ to: '/logout' })}
        >
          登出
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}