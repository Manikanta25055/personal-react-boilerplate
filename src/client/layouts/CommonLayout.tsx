import {
  useColorModeValue,
  chakra,
  Flex,
  HStack,
  Icon,
  Text,
  Box,
} from '@chakra-ui/core';
import React from 'react';
import { FaLinkedin, FaTwitter, FaGithub } from 'react-icons/fa';

import type { WithChildren } from '../Karma';
import { ColorModeSwitch } from '../components/ColorModeSwitch';
import { ExternalLink } from '../components/ExternalLink';
import { LanguageSwitch } from '../components/LanguageSwitch';
import { WebShareButton } from '../components/WebShareButton';
import { KarmaIcon } from '../routes/Index/icons';

export const gitUrl = '//github.com/ljosberinn/next-karma';

function Header() {
  const bg = useColorModeValue('gray.100', 'gray.700');

  return (
    <chakra.header
      borderBottomWidth="1px"
      height="4em"
      position="fixed"
      width="full"
      bg={bg}
      zIndex="1"
    >
      <Flex
        boxSize="100%"
        align="center"
        justify="space-between"
        maxWidth="72em"
        ml="auto"
        mr="auto"
        p="3"
      >
        <Flex align="center">
          <KarmaIcon size="3em" />
          <Text fontWeight="500" pl="2">
            Karma
          </Text>
          <HStack
            as="nav"
            spacing="4"
            ml="12"
            display={{ base: 'none', md: 'flex' }}
          >
            Docs (coming soon)
          </HStack>
        </Flex>

        <Flex width="auto" maxW="720px" align="center" color="gray.500">
          <HStack spacing={2}>
            <LanguageSwitch />
            <ColorModeSwitch />
            <ExternalLink
              omitIcon
              href={gitUrl}
              aria-label="Repository URL"
              d="flex"
              boxSize="10"
              justifyContent="center"
              alignItems="center"
              _hover={{ color: 'teal.600' }}
            >
              <Icon as={FaGithub} boxSize="5" />
            </ExternalLink>
            <WebShareButton
              aria-label="Share this site"
              title="next-karma - opinionated batteries-included Next.js template"
            />
          </HStack>
        </Flex>
      </Flex>
    </chakra.header>
  );
}

const links = [
  {
    href: '//github.com/ljosberinn',
    icon: FaGithub,
    text: 'ljosberinn',
  },
  {
    href: '//twitter.com/gerrit_alex',
    icon: FaTwitter,
    text: '@gerrit_alex',
  },
  {
    href: '//linkedin.com/in/gerrit-alex/',
    icon: FaLinkedin,
    text: 'Gerrit Alex',
  },
];

function Footer() {
  const bg = useColorModeValue('cyan.50', 'gray.800');

  return (
    <chakra.footer
      pt={12}
      pb={20}
      textAlign="center"
      bg={bg}
      borderTop="1px solid"
      borderColor="gray.700"
    >
      <Text fontSize="sm">
        <Box as="span" ml="3">
          MIT by <ExternalLink href="//gerritalex.de">Gerrit Alex</ExternalLink>
        </Box>
      </Text>
      <HStack
        mt={4}
        direction={['column', 'row']}
        spacing="12px"
        justify="center"
      >
        {links.map(({ href, icon, text }) => (
          <ExternalLink omitIcon display="inline-block" href={href} key={href}>
            <Icon as={icon} fontSize="xl" color="gray.400" /> {text}
          </ExternalLink>
        ))}
      </HStack>
    </chakra.footer>
  );
}

export function CommonLayout({ children }: WithChildren): JSX.Element {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
