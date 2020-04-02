/**
 * Handles music logic like timing, etc.
 */

interface Music {
  play: () => void;
  stop: () => void;
}

const workspaceMusic: Music = {
  play: () => {},

  stop: () => {}
};

export { Music, workspaceMusic };
