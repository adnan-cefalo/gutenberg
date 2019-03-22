/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { withInstanceId } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import LegacyWidgetEditDomManager from './dom-manager';

class LegacyWidgetEditHandler extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			form: null,
			idBase: null,
			widgetNumber: null,
		};
		this.instanceUpdating = null;
		this.onInstanceChange = this.onInstanceChange.bind( this );
		this.requestWidgetUpdater = this.requestWidgetUpdater.bind( this );
	}

	componentDidMount() {
		this.isStillMounted = true;
		this.requestWidgetUpdater( undefined, ( response ) => {
			this.props.onInstanceChange( null, !! response.form );
		} );
	}

	componentDidUpdate( prevProps ) {
		if (
			prevProps.instance !== this.props.instance &&
			this.instanceUpdating !== this.props.instance
		) {
			this.requestWidgetUpdater( undefined, ( response ) => {
				this.props.onInstanceChange( null, !! response.form );
			} );
		}
		if ( this.instanceUpdating === this.props.instance ) {
			this.instanceUpdating = null;
		}
	}

	componentWillUnmount() {
		this.isStillMounted = false;
	}

	render() {
		const { instanceId, identifier } = this.props;
		const { id, idBase, form, widgetNumber } = this.state;

		if ( ! form ) {
			return null;
		}
		return (
			<div
				className="wp-block-legacy-widget__edit-container"
				// Display none is used because when we switch from edit to preview,
				// we don't want to unmount the component.
				// Otherwise when we went back to edit we wound need to trigger
				// all widgets events again and some scripts may not deal well with this.
				style={ {
					display: this.props.isVisible ? 'block' : 'none',
				} }
			>
				<LegacyWidgetEditDomManager
					ref={ ( ref ) => {
						this.widgetEditDomManagerRef = ref;
					} }
					onInstanceChange={ this.onInstanceChange }
					widgetNumber={ widgetNumber ? widgetNumber : instanceId * -1 }
					id={ id }
					idBase={ idBase }
					form={ form }
					identifier={ identifier }
				/>
			</div>
		);
	}

	onInstanceChange( instanceChanges ) {
		this.requestWidgetUpdater( instanceChanges, ( response ) => {
			this.instanceUpdating = response.instance;
			this.props.onInstanceChange( response.instance, !! response.form );
		} );
	}

	requestWidgetUpdater( instanceChanges, callback ) {
		const { identifier, instanceId, instance, widgetClass } = this.props;
		if ( ! identifier && ! widgetClass ) {
			return;
		}

		apiFetch( {
			path: `/wp/v2/widgets/`,
			data: {
				identifier,
				instance,
				// use negative ids to make sure the id does not exist on the database.
				id_to_use: instanceId * -1,
				widget_class: widgetClass,
				instance_changes: instanceChanges,
			},
			method: 'POST',
		} ).then(
			( response ) => {
				if ( this.isStillMounted ) {
					this.setState( {
						form: response.form,
						idBase: response.id_base,
						id: response.id,
						widgetNumber: response.number,
					} );
					if ( callback ) {
						callback( response );
					}
				}
			}
		);
	}
}

export default withInstanceId( LegacyWidgetEditHandler );

