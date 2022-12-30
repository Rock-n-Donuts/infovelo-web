import { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import EXIF from 'exif-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';

import { useUserCurrentContribution, useUserUpdateContribution } from '../../contexts/SiteContext';
import { usePrevious } from '../../hooks/usePrevious';
import ImageUpload from './ImageUpload';
import MarkerIcon from '../../icons/Marker';
import contributionTypes from '../../data/contribution-types.json';

import styles from '../../styles/partials/photo-upload-marker.module.scss';
import { exifToCoords } from '../../lib/utils';

const propTypes = {
    className: PropTypes.string,
    onPhotoLocated: PropTypes.func,
};

const defaultProps = {
    className: null,
    onPhotoLocated: null,
};

function PhotoUploadMarker({ className, onPhotoLocated }) {
    const userContribution = useUserCurrentContribution();
    const updateContribution = useUserUpdateContribution();
    const { type = null, quality = null } = userContribution || {};
    const contributionType = useMemo(() => contributionTypes.find(({ id }) => id === type), [type]);
    const { color: typeColor = null, qualities } = contributionType || {};
    const hasQualities = (qualities || []).length > 0;
    const qualityObject = useMemo(
        () => (qualities || []).find(({ value }) => `${value}` === `${quality}`),
        [quality, qualities],
    );
    const { color: qualityColor = null } = qualityObject || {};
    const color = hasQualities && qualityColor !== null ? qualityColor : typeColor;
    const previousColor = usePrevious(color);
    const finalColor = color !== null ? color : previousColor;

    const setPhotoValue = useCallback(
        (photo) => {
            if (photo) {
                EXIF.getData(photo, () => {
                    const exif = EXIF.getAllTags(photo);
                    const coords = exifToCoords(exif);
                    if (coords !== null && onPhotoLocated !== null) {
                        onPhotoLocated(coords);
                    }
                });
            }

            updateContribution({ photo });
        },
        [updateContribution, onPhotoLocated],
    );

    return (
        <div className={classNames([styles.container, { [className]: className !== null }])}>
            <div className={styles.inner}>
                <MarkerIcon className={styles.background} color={finalColor} />
                <ImageUpload className={styles.upload} onChange={setPhotoValue}>
                    <div className={styles.uploadContent}>
                        <div className={styles.icon}>
                            <FontAwesomeIcon icon={faCamera} />
                        </div>
                        <div className={styles.label}>
                            <FormattedMessage id="upload-photo" />
                        </div>
                    </div>
                </ImageUpload>
            </div>
        </div>
    );
}

PhotoUploadMarker.propTypes = propTypes;
PhotoUploadMarker.defaultProps = defaultProps;

export default PhotoUploadMarker;
