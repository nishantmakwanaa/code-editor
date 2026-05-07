/**
 * External link component that renders navigation buttons to GitHub, LinkedIn, etc.
 * Features:
 * - Link buttons with icons
 * - External URL handling
 * - Accessibility support
 *
 * By Nishant Makwana (https://nishantmakwanaa.lovable.app)
 */

import Image from 'next/image';

import { Linkedin } from 'lucide-react';
import { useTheme } from 'next-themes';

import { GITHUB_URL, LINKEDIN_URL } from '@/lib/constants';
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
          GitHub
        </a>
      </Button>
      <Button variant="outline" size="sm" asChild>
        <a
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit LinkedIn profile (opens in new tab)"
        >
          <Linkedin className="mr-2 size-4" />
          LinkedIn
        </a>
      </Button>
    </>
  );
};

export { ExternalLink };
