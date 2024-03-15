import type {SiteConfig} from '@enonic-types/lib-portal';
import type {JavaBridge} from '../JavaBridge';


import {forceArray} from '@enonic/js-utils/array/forceArray'
import {get as getContext} from '../context';
import {getSite} from './getSite';


declare module globalThis {
	var _javaBridge: JavaBridge|undefined;
}


export function getSiteConfig<Config = Record<string, unknown>>(): Config | null {
	if (!globalThis._javaBridge) {
		throw new Error('In order to use the lib-portal.getSiteConfig() mock, an instance of JavaBridge must be created and assigned to globalThis._javaBridge');
	}

	const context = getContext();
	if (!context) {
		throw new Error('No context');
	}

	if (!context.currentApplicationKey) {
		throw new Error('No currentApplicationKey found in mocked run context');
	}

	const site = getSite<Config>();
	if (!site) {
		throw new Error('No site!');
	}

	globalThis._javaBridge.log.debug('site', site);
	if (!site.data.siteConfig) {
		return null;
	}

	const siteConfigsObj = forceArray(site.data.siteConfig);
	globalThis._javaBridge.log.debug('siteConfigsObj', siteConfigsObj);

	const filteredSiteConfigs = siteConfigsObj.filter((siteConfig) => siteConfig.applicationKey === context.currentApplicationKey);
	globalThis._javaBridge.log.debug('filteredSiteConfigs', filteredSiteConfigs);

	if (filteredSiteConfigs.length === 0) {
		return null;
	}
	const aSiteConfig: SiteConfig<Config> = filteredSiteConfigs[0] as SiteConfig<Config>;
	return aSiteConfig.config;
}
