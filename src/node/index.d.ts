import type {
	RepoConnection,
	Source
} from './repoConnection.d';
import type {
	MultiRepoConnection,
	MultiRepoConnectParams
} from './multiRepoConnection.d';


interface NodeLibrary {
	/**
	* Creates a connection to a repository with a given branch and authentication info.
	*/
	connect(params: Source): RepoConnection;

	multiRepoConnect(params: MultiRepoConnectParams): MultiRepoConnection;
}
