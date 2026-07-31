export const DEFAULT_SCRIPT_SHIFTER_URL = 'https://bibframe.org/scriptshifter';

const request = async (url, options) => {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`ScriptShifter request to ${url} failed with status ${response.status}`);
  }

  return response.json();
};

export const getScriptShifterLanguages = (baseUrl = DEFAULT_SCRIPT_SHIFTER_URL) => {
  return request(`${baseUrl}/languages`);
};

export const translateWithScriptShifter = (baseUrl = DEFAULT_SCRIPT_SHIFTER_URL, {
  text,
  lang,
  tDir = 'r2s',
  capitalize = 'no_change',
  options = {},
}) => {
  return request(`${baseUrl}/trans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      lang,
      t_dir: tDir,
      capitalize,
      options,
    }),
  });
};
