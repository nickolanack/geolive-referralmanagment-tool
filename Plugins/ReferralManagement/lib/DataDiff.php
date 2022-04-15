<?php

namespace ReferralManagement;

class DataDiff {

	protected $recursive = true;

	protected $ignore = array();

	public function ignoreKey($keyDotNotationString) {
		$this->ignore[] = $keyDotNotationString;
		return $this;
	}

	protected function _ignoresKey($key, $ignore) {
		if (in_array($key, $ignore)) {
			return true;
		}
		return false;
	}

	protected function _getSubIgnore($key, $ignore) {

		return array_map(function ($keyDotNotationString) use ($key) {

			return str_replace($key . '.', '', $keyDotNotationString);

		}, array_values(array_filter($ignore, function ($keyDotNotationString) use ($key) {

			return strpos($keyDotNotationString, $key . '.') === 0;

		})));
	}

	public function diff($fromData, $toData) {
		$diff = $this->_diff($fromData, $toData, $this->ignore);

		return array(
			'from' => $diff[0],
			'to' => $diff[1],
		);

	}

	public function flatDiff($fromData, $toData) {

		$diff = $this->_diff($fromData, $toData, $this->ignore);

		return array(
			'from' => $this->_flatten($diff[0]),
			'to' => $this->_flatten($diff[1]),
		);

	}

	protected function _flatten($item) {
		$flat = array();

		foreach (array_keys($item) as $key) {

			if (is_array($item[$key])) {
				foreach ($this->_flatten($item[$key]) as $k => $v) {
					$flat[$key . '.' . $k] = $v;
				}
				continue;
			}
			$flat[$key] = $item[$key];

		}

		return $flat;
	}

	protected function _diff($fromData, $toData, $ignore) {

		$fromData = json_decode(json_encode($fromData));
		$toData = json_decode(json_encode($toData));

		// file_put_contents(__DIR__.'/data_diff.json', json_encode(array(
		// 	'from'=>$fromData,
		// 	'to'=>$toData
		// )));

		if (is_object($fromData)) {
			$fromData = get_object_vars($fromData);
		}

		if (is_object($toData)) {
			$toData = get_object_vars($toData);
		}

		$changedArray = array();
		$updateArray = array();

		$newKeys = array_values(array_diff(array_keys($toData), array_keys($fromData)));
		foreach ($newKeys as $key) {

			if ($this->_ignoresKey($key, $ignore)) {
				continue;
			}

			$changedArray[$key] = null;
			$updateArray[$key] = $toData[$key];
		}
		$removedKeys = array_values(array_diff(array_keys($fromData), array_keys($toData)));
		foreach ($removedKeys as $key) {

			if ($this->_ignoresKey($key, $ignore)) {
				continue;
			}

			$changedArray[$key] = $fromData[$key];
			$updateArray[$key] = null;
		}

		$intersect = array_values(array_intersect(array_keys($toData), array_keys($fromData)));
		foreach ($intersect as $key) {

			if ($this->_ignoresKey($key, $ignore)) {
				continue;
			}

			if (gettype($toData[$key]) != gettype($fromData[$key])) {
				$changedArray[$key] = $fromData[$key];
				$updateArray[$key] = $toData[$key];
				continue;
			}

			if ((!$this->recursive) && (is_object($toData[$key]) || is_array($toData[$key]))) {

				if (json_encode($toData[$key]) != json_encode($fromData[$key])) {
					$changedArray[$key] = $fromData[$key];
					$updateArray[$key] = $toData[$key];
				}

				continue;
			}

			if (is_array($toData[$key])) {

				$arrays = $this->_arrayDiff($fromData[$key], $toData[$key], $this->_getSubIgnore($key, $ignore));

				if (json_encode($arrays[0]) == json_encode($arrays[1])) {
					continue;
				}

				$changedArray[$key] = $arrays[0];
				$updateArray[$key] = $arrays[1];
				continue;

			}

			if (is_object($toData[$key])) {

				$arrays = $this->_diff($fromData[$key], $toData[$key], $this->_getSubIgnore($key, $ignore));

				if (json_encode($arrays[0]) == json_encode($arrays[1])) {
					continue;
				}

				$changedArray[$key] = $arrays[0];
				$updateArray[$key] = $arrays[1];
				continue;

			}

			if ($toData[$key] != $fromData[$key]) {
				$changedArray[$key] = $fromData[$key];
				$updateArray[$key] = $toData[$key];
			}

		}

		return array($changedArray, $updateArray);

	}

	protected function _arrayDiff($fromData, $toData, $ignore) {

		$changedArray = array();
		$updateArray = array();

		

		$fromLen = count($fromData);
		$toLen = count($toData);

		if ($fromLen != $toLen) {
			$changedArray['_length'] = $fromLen;
			$updateArray['_length'] = $toLen;
		}






		$fromData = (object) $fromData;
		$toData = (object) $toData;

		

		if (is_object($toData)) {

			$arrays = $this->_diff($fromData, $toData, $ignore);

			if (json_encode($arrays[0]) == json_encode($arrays[1])) {
				return array($changedArray, $updateArray);
			}

			$changedArray = array_merge($changedArray, $arrays[0]);
			$updateArray = array_merge($updateArray, $arrays[1]);

		}

		return array($changedArray, $updateArray);

	}

}