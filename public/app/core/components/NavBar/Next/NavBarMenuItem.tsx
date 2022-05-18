import { css, cx } from '@emotion/css';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { GrafanaTheme2, NavModelItem } from '@grafana/data';
import { config } from '@grafana/runtime';
import { Icon, IconButton, IconName, Link, useTheme2 } from '@grafana/ui';
import { togglePin } from 'app/core/reducers/navBarTree';

export interface OwnProps {
  icon?: IconName;
  isActive?: boolean;
  isDivider?: boolean;
  onClick?: () => void;
  styleOverrides?: string;
  adjustHeightForBorder?: boolean;
  isMobile?: boolean;
  item: NavModelItem;
}

export type Props = OwnProps & ConnectedProps<typeof connector>;

function NavBarMenuItemUnConnected({
  icon,
  isActive,
  isDivider,
  onClick,
  styleOverrides,
  isMobile = false,
  item,
  togglePin,
}: Props) {
  const { id, target, text, url, isSavedItem } = item;
  const theme = useTheme2();
  const styles = getStyles(theme, isActive, Boolean(icon));
  const elStyle = cx(styles.element, styleOverrides);
  const linkContent = (
    <div className={styles.linkContent}>
      {icon && <Icon data-testid="dropdown-child-icon" name={icon} />}
      <span>{text}</span>
      {target === '_blank' && (
        <Icon data-testid="external-link-icon" name="external-link-alt" className={styles.externalLinkIcon} />
      )}
    </div>
  );

  let element = (
    <button className={elStyle} onClick={onClick} tabIndex={-1}>
      {linkContent}
    </button>
  );

  if (url) {
    element =
      !target && url.startsWith('/') ? (
        <Link className={elStyle} href={url} target={target} onClick={onClick} tabIndex={!isMobile ? -1 : 0}>
          {linkContent}
        </Link>
      ) : (
        <a href={url} target={target} className={elStyle} onClick={onClick} tabIndex={!isMobile ? -1 : 0}>
          {linkContent}
        </a>
      );
  }

  if (isMobile) {
    return isDivider ? (
      <li data-testid="dropdown-child-divider" className={styles.divider} tabIndex={-1} aria-disabled />
    ) : (
      <li className={styles.listItem}>
        {element}
        {config.featureToggles.savedItems ? (
          <IconButton
            name="bookmark"
            iconType={isSavedItem ? 'solid' : 'default'}
            onClick={() => togglePin({ id, url })}
          />
        ) : null}
      </li>
    );
  }

  return isDivider ? (
    <div data-testid="dropdown-child-divider" className={styles.divider} tabIndex={-1} aria-disabled />
  ) : (
    <div style={{ position: 'relative' }}>{element}</div>
  );
}

const mapDispatchToProps = {
  togglePin,
};

const connector = connect(null, mapDispatchToProps);

export const NavBarMenuItem = connector(NavBarMenuItemUnConnected);

NavBarMenuItem.displayName = 'NavBarMenuItem';

const getStyles = (theme: GrafanaTheme2, isActive: Props['isActive'], hasIcon: boolean) => ({
  linkContent: css({
    display: 'grid',
    placeItems: 'center',
    gridAutoFlow: 'column',
    gap: '0.5rem',
  }),
  externalLinkIcon: css({
    color: theme.colors.text.secondary,
    gridColumnStart: 3,
  }),
  element: css({
    alignItems: 'center',
    background: 'none',
    border: 'none',
    color: isActive ? theme.colors.text.primary : theme.colors.text.secondary,
    display: 'flex',
    flex: 1,
    fontSize: 'inherit',
    height: '100%',
    overflowWrap: 'anywhere',
    padding: !hasIcon ? `${theme.spacing(0.5, 2)}` : '5px 12px 5px 10px',
    textAlign: 'left',
    width: '100%',
    '&:hover, &:focus-visible': {
      backgroundColor: theme.colors.action.hover,
      color: theme.colors.text.primary,
    },
    '&:focus-visible': {
      boxShadow: 'none',
      outline: `2px solid ${theme.colors.primary.main}`,
      outlineOffset: '-2px',
      transition: 'none',
    },
    '&::before': {
      display: isActive ? 'block' : 'none',
      content: '" "',
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: theme.spacing(0.5),
      borderRadius: theme.shape.borderRadius(1),
      backgroundImage: theme.colors.gradients.brandVertical,
    },
  }),
  listItem: css({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',

    '&:hover, &:focus-within': {
      color: theme.colors.text.primary,

      '> *:first-child::after': {
        backgroundColor: theme.colors.action.hover,
      },
    },
  }),
  divider: css({
    borderBottom: `1px solid ${theme.colors.border.weak}`,
    height: '1px',
    margin: `${theme.spacing(1)} 0`,
    overflow: 'hidden',
  }),
});
