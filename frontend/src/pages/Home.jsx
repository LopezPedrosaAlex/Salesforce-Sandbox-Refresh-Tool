import NavigationComponent from "../components/Navbar";
import Login from "../pages/Login";

export default function Home() {
    return (
        <main className="min-w-screen flex flex-row">
            <NavigationComponent />
            <Login />
        </main>
    );
}
