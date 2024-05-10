


export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            <h2>This is from layout</h2>
            {children}
        </div>
    )
}