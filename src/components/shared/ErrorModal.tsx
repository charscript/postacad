import Modal from 'react-modal';

type ErrorModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  message: string;
};

const ErrorModal = ({ isOpen, onRequestClose, message }: ErrorModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Error Modal"
      className="error-modal"
      overlayClassName="error-modal-overlay"
    >
      <div className="error-modal-content">
        <h2>Error</h2>
        <p>{message}</p>
        <button onClick={onRequestClose}>Close</button>
      </div>
    </Modal>
  );
};

export default ErrorModal;