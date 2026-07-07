import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Page from './page';

describe('Customer portal home', () => {
  it('renders the product workspace shell', () => {
    process.env.CERTISPHERE_BOOTSTRAP_PERMISSIONS = 'customer-portal.workspace.read';

    render(React.createElement(Page));

    expect(screen.getByRole('heading', { name: 'Certisphere™' })).toBeTruthy();
    expect(screen.getByText('Management System Workspace')).toBeTruthy();
  });
});
