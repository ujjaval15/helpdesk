import NavBar from "../components/NavBar";

function Users() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="mx-auto flex max-w-5xl flex-col items-center px-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Users
        </h1>
      </main>
    </div>
  );
}

export default Users;
