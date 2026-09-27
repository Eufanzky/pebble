import pytest

from app.application.errors import AgentReplyError
from app.application.llm_json import parse_json_object


@pytest.mark.parametrize(
    "text",
    ['{"a": 1}', '```json\n{"a": 1}\n```', '```\n{"a": 1}\n```', '  ```json {"a": 1} ```  '],
)
def test_parses_plain_and_fenced_objects(text):
    assert parse_json_object(text) == {"a": 1}


@pytest.mark.parametrize("text", ["", "hello", "[1]", '"a"', "```json\nnope\n```"])
def test_rejects_anything_else(text):
    with pytest.raises(AgentReplyError):
        parse_json_object(text)
