import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import Modal from 'react-modal';
import { ToastContainer } from 'react-toastify';

import App from './App';
import AuthProvider from './context/AuthContext';
import QueryProvider from './lib/react-query/QueryProvider';
import { ModalProvider } from './components/ui/animated-modal';
Modal.setAppElement('#root');

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <QueryProvider>
            <AuthProvider>
                <ModalProvider>
                    <App />
                    <ToastContainer />
                </ModalProvider>

            </AuthProvider>
        </QueryProvider>
    </BrowserRouter>
);