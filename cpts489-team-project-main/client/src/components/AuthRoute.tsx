import { useAuthGuard } from '../hooks/useAuth'
import { Outlet } from 'react-router-dom';
import Loading from './misc/Loading';

function AuthRoute() {
    const auth = useAuthGuard();

    if (auth.loading) {
        return <Loading />;
    }

    return (
        <Outlet />
    );
}

export default AuthRoute