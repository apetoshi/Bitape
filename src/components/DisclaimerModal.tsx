import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Box,
  VStack,
  Link,
  UnorderedList,
  ListItem,
} from '@chakra-ui/react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(2px) brightness(0.7)" />
      <ModalContent
        bg="#001e33"
        borderWidth="1px"
        borderColor="#ffdc00"
        borderRadius="md"
        boxShadow="0 0 10px rgba(255, 220, 0, 0.3)"
        pb={2}
      >
        <ModalHeader fontSize="xl" fontFamily="'Press Start 2P', cursive" color="#ffdc00">
          DISCLAIMER
        </ModalHeader>
        <ModalCloseButton color="#ffdc00" />
        <ModalBody>
          <VStack spacing={4} align="start">
            <Text color="white" fontWeight="bold">
              BitApe is a game and is provided "AS IS" without warranties of any kind, either express or implied.
            </Text>
            
            <Text color="white">
              By using BitApe, you acknowledge and agree to the following:
            </Text>
            
            <UnorderedList spacing={2} pl={5} color="white">
              <ListItem>
                BitApe is a browser-based game operating on the ApeChain network, and any values, tokens or digital assets mentioned or used within the game are part of the gameplay mechanics only.
              </ListItem>
              
              <ListItem>
                The use of blockchain technology, cryptographic tokens, and digital assets in BitApe is subject to regulatory uncertainty and potential technical vulnerabilities.
              </ListItem>
              
              <ListItem>
                You are responsible for your actions, decisions, and risks when participating in the BitApe game, including any potential loss of digital assets.
              </ListItem>
              
              <ListItem>
                BitApe may be unavailable, altered, or discontinued at any time without prior notice, and the development team reserves the right to modify gameplay mechanics.
              </ListItem>
              
              <ListItem>
                You agree to use BitApe in compliance with all applicable laws and regulations in your jurisdiction.
              </ListItem>
            </UnorderedList>
            
            <Box bg="#001420" p={3} borderRadius="md" w="full">
              <Text color="#ffdc00" fontWeight="bold" mb={2}>
                Risk Warning:
              </Text>
              <Text color="white">
                Blockchain gaming and digital assets involve significant risks including, but not limited to, market volatility, regulatory changes, and technical security risks. Only participate with assets you can afford to lose.
              </Text>
            </Box>
            
            <Text color="white" fontSize="sm">
              For more information, please review our <Link href="/terms" color="#ffdc00">Terms of Service</Link> and <Link href="/privacy" color="#ffdc00">Privacy Policy</Link>.
            </Text>
          </VStack>
        </ModalBody>

        <ModalFooter justifyContent="center">
          <Button
            onClick={onClose}
            bg="transparent"
            color="#ffdc00"
            border="1px"
            borderColor="#ffdc00"
            _hover={{ bg: "#ffdc00", color: "#001420" }}
            fontFamily="'Press Start 2P', cursive"
            fontSize="xs"
            py={2}
            className="pixel-button"
          >
            CLOSE
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DisclaimerModal; 