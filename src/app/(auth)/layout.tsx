export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="bg-muted/40 flex h-screen w-full items-center justify-center">
            <main className="w-full max-w-md">{children}</main>
        </div>
    );
}
