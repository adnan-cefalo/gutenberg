/**
 * External dependencies
 */
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { URLPopover } from '@wordpress/block-editor';
import { useState } from '@wordpress/element';
import {
	Button,
	IconButton,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { getIconBySite } from './social-list';

const SocialLinkEdit = ( { attributes, setAttributes, isSelected } ) => {
	const { url, site } = attributes;
	const [ showURLPopover, setPopover ] = useState( true );
	const classes = classNames(
		'wp-social-link',
		'wp-social-link-' + site,
		{ 'wp-social-link__is-incomplete': url },
	);

	// Import icon.
	const IconComponent = getIconBySite( site );

	return (
		<Button
			className={ classes }
			onClick={ () => setPopover( true ) }
		>
			<IconComponent />
			{ isSelected && showURLPopover && (
				<URLPopover
					onClose={ () => setPopover( false ) }
				>
					<form className="block-editor-url-popover__link-editor" onSubmit={ () => setPopover( false ) }>
						<div className="editor-url-input block-editor-url-input">
							<input type="text"
								value={ url }
								onChange={ ( event ) => setAttributes( { url: event.target.value } ) }
								placeholder={ __( 'Enter site URL' ) }
							/>
						</div>
						<IconButton icon="editor-break" label={ __( 'Apply' ) } type="submit" />
					</form>
				</URLPopover>
			) }
		</Button>
	);
};

export default SocialLinkEdit;
