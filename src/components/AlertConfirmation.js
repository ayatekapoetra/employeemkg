import React, { useRef } from 'react'
import { AlertDialog, Button } from 'native-base'

const AlertConfirmation = ({title, subtitle, txtConfirm, isOpen, onClose, onAction}) => {
    const cancelRef = useRef(null);
    return (
        <AlertDialog leastDestructiveRef={cancelRef} isOpen={isOpen} onClose={onClose}>
            <AlertDialog.Content>
                <AlertDialog.CloseButton />
                <AlertDialog.Header>{title || "Delete Data"}</AlertDialog.Header>
                <AlertDialog.Body>
                    {subtitle || "Anda akan menghapus data ini, hati-hati data tidak dapat dipulihkan kembali..."}
                </AlertDialog.Body>
                <AlertDialog.Footer>
                    <Button.Group space={2}>
                        <Button variant="unstyled" colorScheme="coolGray" onPress={onClose} ref={cancelRef}>
                            Cancel
                        </Button>
                        <Button colorScheme="danger" onPress={onAction}>
                            {txtConfirm || "Delete"}
                        </Button>
                    </Button.Group>
                </AlertDialog.Footer>
            </AlertDialog.Content>
        </AlertDialog>
    )
}

export default AlertConfirmation