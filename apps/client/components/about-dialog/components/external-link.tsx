/**
 * External link component that renders navigation buttons to portfolio, GitHub, etc.
 * Features:
 * - Link buttons with icons
 * - External URL handling
 * - Accessibility support
 */

import Image from 'next/image';

import { Send, Linkedin } from 'lucide-react';
import { useTheme } from 'next-themes';

import {
  CONTACT_URL,
  GITHUB_URL,
  LINKEDIN_URL,
  PORTFOLIO_URL,
  REPO_URL,
} from '@/lib/constants';
import { Button } from '@/components/ui/button';

interface ExternalLinkProps {
  forceDark?: boolean;
}

const ExternalLink = ({ forceDark = false }: ExternalLinkProps) => {
  const { resolvedTheme } = useTheme();

  return (
    <>
      <Button variant="outline" size="sm" asChild>
        <a
          href={PORTFOLIO_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit portfolio website (opens in new tab)"
        >
          <Image
            src="/images/alpha-logo.svg"
            alt="Alpha logo"
            className="mr-2"
            width={16}
            height={16}
          />
          Website
        </a>
      </Button>
      <Button variant="outline" size="sm" asChild>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit GitHub profile (opens in new tab)"
        >
          <Image
            src={`/images/${resolvedTheme === 'light' && !forceDark ? 'octocat' : 'octocat-white'}.svg`}
            alt="GitHub logo"
            className="mr-2"
            width={16}
            height={16}
          />
          GitHub Profile
        </a>
      </Button>
      <Button variant="outline" size="sm" asChild>
        <a
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit LinkedIn profile (opens in new tab)"
        >
          <Linkedin className="mr-2 h-4 w-4" />
          LinkedIn
        </a>
      </Button>
      <Button variant="outline" size="sm" asChild>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit CodeX GitHub repository (opens in new tab)"
        >
          <Image
            src={`/images/${resolvedTheme === 'light' && !forceDark ? 'octocat' : 'octocat-white'}.svg`}
            alt="GitHub logo"
            className="mr-2"
            width={16}
            height={16}
          />
          Alpha GitHub
        </a>
      </Button>
      <Button variant="outline" size="sm" asChild>
        <a
          href={CONTACT_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact me (opens in new tab)"
        >
          <Send className="mr-2 size-4" />
          Contact Me
        </a>
      </Button>
    </>
  );
};

export { ExternalLink };
